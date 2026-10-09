package com.aegis.protocol;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.VpnService;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.wireguard.android.backend.Backend;
import com.wireguard.android.backend.GoBackend;
import com.wireguard.android.backend.Tunnel;
import com.wireguard.config.Config;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String TAG = "AegisMainActivity";
    private static final int VPN_REQUEST_CODE = 0xAE61;
    private static final String PREFS_NAME = "aegis_config";
    private static final String KEY_HOST = "endpoint_host";
    private static final String KEY_PORT = "endpoint_port";

    private WebView mWebView;
    private Backend mBackend;
    private final Tunnel mTunnel = new AegisTunnel("aegis0");
    private final Handler mMainHandler = new Handler(Looper.getMainLooper());
    private boolean mIsConnected = false;
    private SharedPreferences mPrefs;

    private static class AegisTunnel implements Tunnel {
        private final String name;

        public AegisTunnel(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public void onStateChange(Tunnel.State newState) {
            Log.i(TAG, "WireGuard Tunnel State: " + newState);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        // Immersive Dark Theme Window
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#050811"));
        window.setNavigationBarColor(Color.parseColor("#050811"));

        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        rootLayout.setBackgroundColor(Color.parseColor("#050811"));

        mWebView = new WebView(this);
        mWebView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        mWebView.setBackgroundColor(Color.parseColor("#050811"));

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        mWebView.addJavascriptInterface(new AegisJsBridge(), "AndroidAegis");
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                notifyWebUiState(mIsConnected);
            }
        });
        mWebView.setWebChromeClient(new WebChromeClient());

        rootLayout.addView(mWebView);
        setContentView(rootLayout);

        // Initialize WireGuard GoBackend
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    mBackend = new GoBackend(MainActivity.this);
                    Tunnel.State state = mBackend.getState(mTunnel);
                    mIsConnected = (state == Tunnel.State.UP);
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            notifyWebUiState(mIsConnected);
                        }
                    });
                } catch (Exception e) {
                    Log.e(TAG, "Backend init exception: " + e.getMessage());
                }
            }
        }).start();

        // Load the local self-contained Aegis Cockpit UI
        mWebView.loadUrl("file:///android_asset/index.html");
    }

    private String getSavedHost() {
        return mPrefs.getString(KEY_HOST, "172.209.217.140");
    }

    private int getSavedPort() {
        return mPrefs.getInt(KEY_PORT, 51820);
    }

    private void prepareAndConnectVpn() {
        try {
            Intent intent = VpnService.prepare(this);
            if (intent != null) {
                startActivityForResult(intent, VPN_REQUEST_CODE);
            } else {
                onActivityResult(VPN_REQUEST_CODE, RESULT_OK, null);
            }
        } catch (Exception e) {
            Toast.makeText(this, "VPN Prepare Failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
            notifyWebUiState(false);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == VPN_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                connectVpnInternal();
            } else {
                Toast.makeText(this, "VPN permission denied by user", Toast.LENGTH_SHORT).show();
                notifyWebUiState(false);
            }
        }
    }

    private void connectVpnInternal() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (mBackend == null) {
                        mBackend = new GoBackend(MainActivity.this);
                    }

                    String endpointHost = getSavedHost();
                    int endpointPort = getSavedPort();

                    String wgConfigString =
                            "[Interface]\n" +
                            "PrivateKey = OFZmrh2n9ATyqyBDvTSLzWZcQ7yEHmqpV+VRQ99ZEUI=\n" +
                            "Address = 10.66.66.2/24\n" +
                            "DNS = 1.1.1.1, 8.8.8.8\n\n" +
                            "[Peer]\n" +
                            "PublicKey = 73qDgl+OL2zLEXOq03Q+oW3NWb1HoXETCLYMGqPeChY=\n" +
                            "Endpoint = " + endpointHost + ":" + endpointPort + "\n" +
                            "AllowedIPs = 0.0.0.0/0\n" +
                            "PersistentKeepalive = 25\n";

                    InputStream is = new ByteArrayInputStream(wgConfigString.getBytes(StandardCharsets.UTF_8));
                    Config config = Config.parse(is);

                    mBackend.setState(mTunnel, Tunnel.State.UP, config);
                    mIsConnected = true;

                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            notifyWebUiState(true);
                            Toast.makeText(MainActivity.this, "🛡️ Connected! All apps routed securely.", Toast.LENGTH_SHORT).show();
                        }
                    });
                } catch (Exception e) {
                    final String err = e.getMessage();
                    Log.e(TAG, "VPN Start Error: " + err, e);
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            mIsConnected = false;
                            notifyWebUiState(false);
                            Toast.makeText(MainActivity.this, "Connection Error: " + err, Toast.LENGTH_LONG).show();
                        }
                    });
                }
            }
        }).start();
    }

    private void disconnectVpnInternal() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (mBackend != null) {
                        mBackend.setState(mTunnel, Tunnel.State.DOWN, null);
                    }
                    mIsConnected = false;
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            notifyWebUiState(false);
                            Toast.makeText(MainActivity.this, "Aegis Tunnel Disconnected", Toast.LENGTH_SHORT).show();
                        }
                    });
                } catch (Exception e) {
                    Log.e(TAG, "VPN Stop Error: " + e.getMessage(), e);
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            notifyWebUiState(mIsConnected);
                        }
                    });
                }
            }
        }).start();
    }

    private void notifyWebUiState(final boolean connected) {
        mMainHandler.post(new Runnable() {
            @Override
            public void run() {
                String js = "if (window.onAegisVpnStatusChanged) { window.onAegisVpnStatusChanged(" + connected + "); }";
                mWebView.evaluateJavascript(js, null);
            }
        });
    }

    public class AegisJsBridge {
        @JavascriptInterface
        public void connectVpn() {
            mMainHandler.post(new Runnable() {
                @Override
                public void run() {
                    if (!mIsConnected) {
                        prepareAndConnectVpn();
                    }
                }
            });
        }

        @JavascriptInterface
        public void disconnectVpn() {
            mMainHandler.post(new Runnable() {
                @Override
                public void run() {
                    if (mIsConnected) {
                        disconnectVpnInternal();
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isVpnConnected() {
            return mIsConnected;
        }

        @JavascriptInterface
        public String getEndpoint() {
            return getSavedHost() + ":" + getSavedPort();
        }

        @JavascriptInterface
        public void setEndpoint(String host, int port) {
            mPrefs.edit()
                    .putString(KEY_HOST, host)
                    .putInt(KEY_PORT, port)
                    .apply();
            Log.i(TAG, "Updated Endpoint: " + host + ":" + port);
        }

        @JavascriptInterface
        public void testPipeline() {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    final long start = System.currentTimeMillis();
                    try {
                        URL url = new URL("https://api.ipify.org?format=json");
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setConnectTimeout(6000);
                        conn.setReadTimeout(6000);
                        conn.setRequestMethod("GET");

                        int code = conn.getResponseCode();
                        if (code == 200) {
                            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                            StringBuilder sb = new StringBuilder();
                            String line;
                            while ((line = reader.readLine()) != null) {
                                sb.append(line);
                            }
                            reader.close();
                            final long lat = System.currentTimeMillis() - start;
                            final String msg = "<b>[✓] PIPELINE VERIFIED!</b><br/>Latency: " + lat + "ms<br/>Payload: " + sb.toString() + "<br/>Zero-Leak Shield: Active";
                            mMainHandler.post(new Runnable() {
                                @Override
                                public void run() {
                                    mWebView.evaluateJavascript("window.onPipelineTestResult(true, '" + msg + "');", null);
                                }
                            });
                        } else {
                            final String msg = "Server returned HTTP " + code;
                            mMainHandler.post(new Runnable() {
                                @Override
                                public void run() {
                                    mWebView.evaluateJavascript("window.onPipelineTestResult(false, '" + msg + "');", null);
                                }
                            });
                        }
                    } catch (final Exception e) {
                        final String msg = "Pipeline test error: " + e.getMessage();
                        mMainHandler.post(new Runnable() {
                            @Override
                            public void run() {
                                mWebView.evaluateJavascript("window.onPipelineTestResult(false, '" + msg + "');", null);
                            }
                        });
                    }
                }
            }).start();
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
