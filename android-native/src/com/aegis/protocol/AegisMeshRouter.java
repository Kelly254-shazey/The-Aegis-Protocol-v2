package com.aegis.protocol;

import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * The Aegis Protocol — Mobile Hotspot Mesh Router & Tethering Gateway
 * 
 * Runs a micro proxy & transparent TCP relay inside the Android app process.
 * Since the app process is routed through the VpnService (tun0), all hotspot clients
 * connecting through this router automatically have their traffic securely tunneled
 * via WireGuard Noise_IK + 256-bit PSK through the Azure Cloud & Laptop pipeline!
 */
public class AegisMeshRouter {
    private static final String TAG = "AegisMeshRouter";
    private static final int BUFFER_SIZE = 16384;
    private static final int SOCKET_TIMEOUT_MS = 60000;

    public enum PolicyMode {
        OPEN,       // All friends connect & get internet immediately
        APPROVAL,   // Host must approve each device in the app
        VOUCHER     // Friends must enter a voucher code (pay-as-you-use)
    }

    public static class ConnectedClient {
        public final String ip;
        public String hostname;
        public final long firstSeen;
        public volatile long lastSeen;
        public final AtomicLong bytesUp = new AtomicLong(0);
        public final AtomicLong bytesDown = new AtomicLong(0);
        public volatile boolean isAuthorized;
        public volatile long dataLimitBytes; // 0 = unlimited
        public volatile long expiresAtMs;    // 0 = unlimited

        public ConnectedClient(String ip, boolean defaultAuthorized) {
            this.ip = ip;
            this.hostname = "Device (" + ip + ")";
            this.firstSeen = System.currentTimeMillis();
            this.lastSeen = System.currentTimeMillis();
            this.isAuthorized = defaultAuthorized;
            this.dataLimitBytes = 0;
            this.expiresAtMs = 0;
        }

        public boolean isExpiredOrExceeded() {
            if (expiresAtMs > 0 && System.currentTimeMillis() > expiresAtMs) {
                return true;
            }
            if (dataLimitBytes > 0 && (bytesUp.get() + bytesDown.get()) >= dataLimitBytes) {
                return true;
            }
            return false;
        }
    }

    private final Context mContext;
    private ServerSocket mServerSocket;
    private ExecutorService mThreadPool;
    private final AtomicBoolean mIsRunning = new AtomicBoolean(false);
    private int mPort = 8080;
    private PolicyMode mPolicyMode = PolicyMode.OPEN;

    private final ConcurrentHashMap<String, ConnectedClient> mClients = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> mVouchers = new ConcurrentHashMap<>(); // code -> durationMinutes
    private final SecureRandom mRandom = new SecureRandom();

    public AegisMeshRouter(Context context) {
        this.mContext = context;
    }

    public synchronized boolean start(int port) {
        if (mIsRunning.get()) {
            return true;
        }
        this.mPort = port;
        try {
            mServerSocket = new ServerSocket();
            mServerSocket.setReuseAddress(true);
            mServerSocket.bind(new InetSocketAddress(mPort));
            mIsRunning.set(true);

            mThreadPool = Executors.newCachedThreadPool(new ThreadFactory() {
                private int count = 0;
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "AegisRouterWorker-" + (++count));
                    t.setDaemon(true);
                    return t;
                }
            });

            mThreadPool.execute(new Runnable() {
                @Override
                public void run() {
                    acceptLoop();
                }
            });

            Log.i(TAG, "Aegis Mesh Router started on port " + mPort);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to start Aegis Mesh Router: " + e.getMessage(), e);
            mIsRunning.set(false);
            return false;
        }
    }

    public synchronized void stop() {
        mIsRunning.set(false);
        if (mServerSocket != null) {
            try {
                mServerSocket.close();
            } catch (Exception ignored) {}
            mServerSocket = null;
        }
        if (mThreadPool != null) {
            mThreadPool.shutdownNow();
            mThreadPool = null;
        }
        Log.i(TAG, "Aegis Mesh Router stopped");
    }

    public boolean isRunning() {
        return mIsRunning.get();
    }

    public int getPort() {
        return mPort;
    }

    public void setPolicyMode(PolicyMode mode) {
        this.mPolicyMode = mode;
    }

    public PolicyMode getPolicyMode() {
        return mPolicyMode;
    }

    public String getGatewayIp() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : interfaces) {
                if (nif.isLoopback() || !nif.isUp()) continue;
                String name = nif.getName().toLowerCase();
                // Priority: Hotspot / AP / Tethering interfaces
                if (name.contains("wlan") || name.contains("ap") || name.contains("rndis") || name.contains("swlan") || name.contains("p2p")) {
                    List<InetAddress> addresses = Collections.list(nif.getInetAddresses());
                    for (InetAddress addr : addresses) {
                        if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                            return addr.getHostAddress();
                        }
                    }
                }
            }
            // Fallback: Check any non-loopback IPv4
            for (NetworkInterface nif : interfaces) {
                if (nif.isLoopback() || !nif.isUp()) continue;
                List<InetAddress> addresses = Collections.list(nif.getInetAddresses());
                for (InetAddress addr : addresses) {
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (!ip.startsWith("10.66.66.")) { // Avoid returning the internal VPN tunnel IP
                            return ip;
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return "192.168.43.1"; // Standard Android Hotspot Gateway Default
    }

    private void acceptLoop() {
        while (mIsRunning.get() && mServerSocket != null && !mServerSocket.isClosed()) {
            try {
                final Socket clientSocket = mServerSocket.accept();
                clientSocket.setTcpNoDelay(true);
                clientSocket.setSoTimeout(SOCKET_TIMEOUT_MS);
                mThreadPool.execute(new Runnable() {
                    @Override
                    public void run() {
                        handleClientConnection(clientSocket);
                    }
                });
            } catch (SocketException se) {
                break; // Server socket was closed
            } catch (Exception e) {
                Log.w(TAG, "Accept error: " + e.getMessage());
            }
        }
    }

    private void handleClientConnection(Socket clientSocket) {
        String clientIp = clientSocket.getInetAddress().getHostAddress();
        ConnectedClient client = getOrCreateClient(clientIp);
        client.lastSeen = System.currentTimeMillis();

        InputStream in = null;
        OutputStream out = null;
        Socket targetSocket = null;

        try {
            in = clientSocket.getInputStream();
            out = clientSocket.getOutputStream();

            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.ISO_8859_1));
            String initialLine = reader.readLine();
            if (initialLine == null || initialLine.trim().isEmpty()) {
                clientSocket.close();
                return;
            }

            String[] parts = initialLine.split("\\s+");
            if (parts.length < 2) {
                clientSocket.close();
                return;
            }

            String method = parts[0].toUpperCase();
            String uri = parts[1];

            // 1. Handle Proxy Auto-Configuration (PAC / WPAD)
            if (uri.endsWith("/wpad.dat") || uri.endsWith("/proxy.pac")) {
                sendPacResponse(out);
                clientSocket.close();
                return;
            }

            // 2. Handle Aegis Hotspot Portal / Captive Check
            if (uri.startsWith("/aegis/") || uri.equals("/") && (method.equals("GET") || method.equals("POST"))) {
                if (handlePortalRequest(method, uri, reader, out, client)) {
                    clientSocket.close();
                    return;
                }
            }

            // 3. Check Authorization & Limits
            boolean authorized = isClientAuthorized(client);
            if (!authorized) {
                if (method.equals("CONNECT")) {
                    // Refuse HTTPS connect until authorized
                    out.write("HTTP/1.1 403 Forbidden (Aegis Hotspot: Pass Required)\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nAccess requires Aegis authorization.\r\n".getBytes(StandardCharsets.UTF_8));
                    out.flush();
                } else {
                    // Redirect HTTP requests to Captive Splash Portal
                    sendCaptiveRedirect(out, client);
                }
                clientSocket.close();
                return;
            }

            // 4. Client is Authorized -> Forward through the encrypted mesh tunnel!
            if (method.equals("CONNECT")) {
                // HTTPS Tunnel
                String[] hostPort = uri.split(":");
                String host = hostPort[0];
                int port = hostPort.length > 1 ? Integer.parseInt(hostPort[1]) : 443;

                // Read remaining headers until blank line
                String header;
                while ((header = reader.readLine()) != null && !header.isEmpty()) {}

                // Create outbound socket. This socket is automatically routed into tun0 by VpnService!
                targetSocket = new Socket();
                targetSocket.setTcpNoDelay(true);
                targetSocket.setSoTimeout(SOCKET_TIMEOUT_MS);
                targetSocket.connect(new InetSocketAddress(host, port), 8000);

                // Notify client tunnel is ready
                out.write("HTTP/1.1 200 Connection Established\r\nProxy-Agent: AegisMeshRouter/2.0\r\n\r\n".getBytes(StandardCharsets.UTF_8));
                out.flush();

                // Bi-directional pipe
                pipeSockets(clientSocket, targetSocket, client);
            } else {
                // Standard HTTP forwarding
                URL url;
                if (uri.startsWith("http://")) {
                    url = new URL(uri);
                } else {
                    url = new URL("http://" + uri);
                }
                String host = url.getHost();
                int port = url.getPort() != -1 ? url.getPort() : 80;

                targetSocket = new Socket();
                targetSocket.setTcpNoDelay(true);
                targetSocket.setSoTimeout(SOCKET_TIMEOUT_MS);
                targetSocket.connect(new InetSocketAddress(host, port), 8000);

                OutputStream targetOut = targetSocket.getOutputStream();
                String relPath = url.getFile();
                if (relPath == null || relPath.isEmpty()) relPath = "/";

                // Reconstruct request line
                String rewritten = method + " " + relPath + " " + (parts.length > 2 ? parts[2] : "HTTP/1.1") + "\r\n";
                targetOut.write(rewritten.getBytes(StandardCharsets.ISO_8859_1));

                // Forward headers, stripping hop-by-hop headers
                String header;
                while ((header = reader.readLine()) != null && !header.isEmpty()) {
                    String lower = header.toLowerCase();
                    if (!lower.startsWith("proxy-connection:") && !lower.startsWith("proxy-authorization:")) {
                        targetOut.write((header + "\r\n").getBytes(StandardCharsets.ISO_8859_1));
                    }
                }
                targetOut.write("\r\n".getBytes(StandardCharsets.ISO_8859_1));
                targetOut.flush();

                // Bi-directional pipe
                pipeSockets(clientSocket, targetSocket, client);
            }

        } catch (Exception e) {
            // Socket closed or aborted normally
        } finally {
            closeQuietly(targetSocket);
            closeQuietly(clientSocket);
        }
    }

    private void pipeSockets(final Socket clientSock, final Socket targetSock, final ConnectedClient client) {
        final CountDownLatch latch = new CountDownLatch(2);

        // Upload Thread: Client -> Target
        mThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    InputStream cin = clientSock.getInputStream();
                    OutputStream tout = targetSock.getOutputStream();
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int read;
                    while ((read = cin.read(buffer)) != -1) {
                        if (client.isExpiredOrExceeded()) break;
                        tout.write(buffer, 0, read);
                        tout.flush();
                        client.bytesUp.addAndGet(read);
                        client.lastSeen = System.currentTimeMillis();
                    }
                } catch (Exception ignored) {
                } finally {
                    closeQuietly(targetSock);
                    latch.countDown();
                }
            }
        });

        // Download Thread: Target -> Client
        mThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    InputStream tin = targetSock.getInputStream();
                    OutputStream cout = clientSock.getOutputStream();
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int read;
                    while ((read = tin.read(buffer)) != -1) {
                        if (client.isExpiredOrExceeded()) break;
                        cout.write(buffer, 0, read);
                        cout.flush();
                        client.bytesDown.addAndGet(read);
                        client.lastSeen = System.currentTimeMillis();
                    }
                } catch (Exception ignored) {
                } finally {
                    closeQuietly(clientSock);
                    latch.countDown();
                }
            }
        });

        try {
            latch.await(SOCKET_TIMEOUT_MS, TimeUnit.MILLISECONDS);
        } catch (Exception ignored) {}
    }

    private boolean isClientAuthorized(ConnectedClient client) {
        if (client.isExpiredOrExceeded()) {
            client.isAuthorized = false;
            return false;
        }
        if (mPolicyMode == PolicyMode.OPEN) {
            client.isAuthorized = true;
            return true;
        }
        return client.isAuthorized;
    }

    private ConnectedClient getOrCreateClient(String ip) {
        ConnectedClient client = mClients.get(ip);
        if (client == null) {
            boolean defaultAuth = (mPolicyMode == PolicyMode.OPEN);
            client = new ConnectedClient(ip, defaultAuth);
            mClients.put(ip, client);
        }
        return client;
    }

    private void sendPacResponse(OutputStream out) throws IOException {
        String gateway = getGatewayIp();
        String pac = "function FindProxyForURL(url, host) {\n" +
                "  if (isPlainHostName(host) || host === '127.0.0.1' || host === '" + gateway + "') return 'DIRECT';\n" +
                "  return 'PROXY " + gateway + ":" + mPort + "; DIRECT';\n" +
                "}\n";
        byte[] bytes = pac.getBytes(StandardCharsets.UTF_8);
        String header = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: application/x-ns-proxy-autoconfig\r\n" +
                "Content-Length: " + bytes.length + "\r\n" +
                "Cache-Control: no-cache\r\n" +
                "Connection: close\r\n\r\n";
        out.write(header.getBytes(StandardCharsets.UTF_8));
        out.write(bytes);
        out.flush();
    }

    private void sendCaptiveRedirect(OutputStream out, ConnectedClient client) throws IOException {
        String gateway = getGatewayIp();
        String body = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
                "<title>Aegis Mesh Hotspot Portal</title>" +
                "<style>" +
                "body{background:#050811;color:#f8fafc;font-family:sans-serif;padding:24px;text-align:center;}" +
                ".card{background:rgba(13,22,45,0.9);border:1px solid #1e3a6e;border-radius:16px;padding:24px;max-width:380px;margin:30px auto;box-shadow:0 0 20px rgba(6,182,212,0.2);}" +
                "h2{color:#06b6d4;margin-bottom:8px;}p{color:#94a3b8;font-size:14px;margin-bottom:20px;}" +
                "input{width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid #1e3a6e;background:#090d1a;color:#fff;font-size:16px;text-align:center;margin-bottom:14px;}" +
                "button{width:100%;padding:14px;border:none;border-radius:10px;background:#06b6d4;color:#050811;font-weight:bold;font-size:16px;cursor:pointer;}" +
                "</style></head><body>" +
                "<div class='card'>" +
                "<h2>🛡️ Aegis Mesh AP</h2>" +
                "<p>This hotspot is protected by The Aegis Protocol. Enter a voucher pass or request access from the host.</p>" +
                "<form action='http://" + gateway + ":" + mPort + "/aegis/redeem' method='POST'>" +
                "<input type='text' name='code' placeholder='ENTER PASS CODE' required />" +
                "<button type='submit'>Unlock Internet</button>" +
                "</form>" +
                "<div style='margin-top:16px;font-size:12px;color:#64748b;'>Your IP: " + client.ip + " | Noise_IK Tunnel Protected</div>" +
                "</div></body></html>";
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        String header = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: text/html; charset=utf-8\r\n" +
                "Content-Length: " + bytes.length + "\r\n" +
                "Connection: close\r\n\r\n";
        out.write(header.getBytes(StandardCharsets.UTF_8));
        out.write(bytes);
        out.flush();
    }

    private boolean handlePortalRequest(String method, String uri, BufferedReader reader, OutputStream out, ConnectedClient client) throws IOException {
        if (uri.startsWith("/aegis/redeem") && method.equals("POST")) {
            // Read headers to get Content-Length
            int length = 0;
            String header;
            while ((header = reader.readLine()) != null && !header.isEmpty()) {
                if (header.toLowerCase().startsWith("content-length:")) {
                    try {
                        length = Integer.parseInt(header.split(":")[1].trim());
                    } catch (Exception ignored) {}
                }
            }
            char[] bodyChars = new char[length];
            if (length > 0) {
                reader.read(bodyChars, 0, length);
            }
            String body = new String(bodyChars);
            String code = "";
            for (String param : body.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("code")) {
                    code = URLDecoder.decode(kv[1], "UTF-8").trim().toUpperCase();
                }
            }

            Long duration = mVouchers.get(code);
            boolean success = false;
            if (duration != null) {
                success = true;
                client.isAuthorized = true;
                client.expiresAtMs = duration > 0 ? (System.currentTimeMillis() + duration * 60 * 1000) : 0;
                mVouchers.remove(code); // single-use
            }

            String respHtml = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
                    "<style>body{background:#050811;color:#fff;font-family:sans-serif;text-align:center;padding:40px;}</style></head><body>" +
                    (success ?
                            "<h2 style='color:#10b981;'>✓ Pass Activated!</h2><p>You are now connected to the Aegis Protocol Tunnel. Enjoy unrestricted anonymous internet.</p>" :
                            "<h2 style='color:#ef4444;'>✕ Invalid Code</h2><p>The voucher code is invalid or already used. Please contact the host.</p><a href='/' style='color:#06b6d4;'>Try Again</a>") +
                    "</body></html>";
            byte[] bytes = respHtml.getBytes(StandardCharsets.UTF_8);
            out.write(("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " + bytes.length + "\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            out.write(bytes);
            out.flush();
            return true;
        }
        return false;
    }

    public String generateVoucher(long durationMinutes) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(mRandom.nextInt(chars.length())));
        }
        String code = "AEGIS-" + sb.toString();
        mVouchers.put(code, durationMinutes);
        return code;
    }

    public JSONArray getConnectedClientsJson() {
        JSONArray arr = new JSONArray();
        long now = System.currentTimeMillis();
        for (ConnectedClient c : mClients.values()) {
            // Keep clients seen in last 10 minutes
            if (now - c.lastSeen < 10 * 60 * 1000) {
                try {
                    JSONObject obj = new JSONObject();
                    obj.put("ip", c.ip);
                    obj.put("hostname", c.hostname);
                    obj.put("bytesUp", c.bytesUp.get());
                    obj.put("bytesDown", c.bytesDown.get());
                    obj.put("firstSeen", c.firstSeen);
                    obj.put("lastSeen", c.lastSeen);
                    obj.put("isAuthorized", c.isAuthorized);
                    obj.put("dataLimitBytes", c.dataLimitBytes);
                    obj.put("expiresAtMs", c.expiresAtMs);
                    arr.put(obj);
                } catch (Exception ignored) {}
            }
        }
        return arr;
    }

    public boolean setClientAuthorized(String ip, boolean authorized, long dataLimitBytes, long durationMinutes) {
        ConnectedClient client = mClients.get(ip);
        if (client != null) {
            client.isAuthorized = authorized;
            client.dataLimitBytes = dataLimitBytes;
            client.expiresAtMs = durationMinutes > 0 ? (System.currentTimeMillis() + durationMinutes * 60 * 1000) : 0;
            return true;
        }
        return false;
    }

    public boolean kickClient(String ip) {
        ConnectedClient client = mClients.remove(ip);
        return client != null;
    }

    private void closeQuietly(Closeable c) {
        if (c != null) {
            try {
                c.close();
            } catch (Exception ignored) {}
        }
    }

    private void closeQuietly(Socket s) {
        if (s != null) {
            try {
                s.close();
            } catch (Exception ignored) {}
        }
    }
}
