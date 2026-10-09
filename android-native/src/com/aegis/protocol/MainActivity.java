package com.aegis.protocol;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.VpnService;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.wireguard.android.backend.Backend;
import com.wireguard.android.backend.GoBackend;
import com.wireguard.android.backend.Tunnel;
import com.wireguard.config.Config;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String TAG = "AegisMainActivity";
    private static final int VPN_REQUEST_CODE = 0xAE61;
    private static final String PORTAL_URL = "https://172-209-217-140.sslip.io";

    private static final String DEFAULT_WG_CONFIG =
            "[Interface]\n" +
            "PrivateKey = OFZmrh2n9ATyqyBDvTSLzWZcQ7yEHmqpV+VRQ99ZEUI=\n" +
            "Address = 10.66.66.2/24\n" +
            "DNS = 1.1.1.1, 8.8.8.8\n\n" +
            "[Peer]\n" +
            "PublicKey = 73qDgl+OL2zLEXOq03Q+oW3NWb1HoXETCLYMGqPeChY=\n" +
            "Endpoint = 172.209.217.140:51820\n" +
            "AllowedIPs = 0.0.0.0/0\n" +
            "PersistentKeepalive = 25\n";

    private WebView mWebView;
    private Button mNativeConnectBtn;
    private TextView mNativeStatusText;
    private Backend mBackend;
    private final Tunnel mTunnel = new AegisTunnel("aegis0");
    private final Handler mMainHandler = new Handler(Looper.getMainLooper());
    private boolean mIsConnected = false;

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
            Log.i(TAG, "WireGuard Tunnel State changed to: " + newState);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Root container: FrameLayout
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        rootLayout.setBackgroundColor(Color.parseColor("#050811"));

        // 1. Hardware Accelerated WebView
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
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        mWebView.addJavascriptInterface(new AegisJsBridge(), "AndroidAegis");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // SSL handler for sslip.io / Cloud VM certificates
                handler.proceed();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                notifyWebUiState(mIsConnected);
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient());
        rootLayout.addView(mWebView);

        // 2. Native Floating Control Bar at the Bottom
        // This ensures the user can ALWAYS tap Connect even before any web page loads!
        LinearLayout bottomBar = new LinearLayout(this);
        bottomBar.setOrientation(LinearLayout.VERTICAL);
        bottomBar.setPadding(32, 24, 32, 32);
        bottomBar.setBackgroundColor(Color.parseColor("#E60b1329")); // Deep slate frosted glass

        FrameLayout.LayoutParams barParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        barParams.gravity = Gravity.BOTTOM;
        bottomBar.setLayoutParams(barParams);

        mNativeStatusText = new TextView(this);
        mNativeStatusText.setText("🛡️ THE AEGIS PROTOCOL: STANDBY (0 IP LEAK)");
        mNativeStatusText.setTextColor(Color.parseColor("#94a3b8"));
        mNativeStatusText.setTextSize(12);
        mNativeStatusText.setGravity(Gravity.CENTER);
        mNativeStatusText.setPadding(0, 0, 0, 16);
        bottomBar.addView(mNativeStatusText);

        mNativeConnectBtn = new Button(this);
        mNativeConnectBtn.setText("CONNECT TO ANONYMOUS INTERNET");
        mNativeConnectBtn.setTextColor(Color.parseColor("#050811"));
        mNativeConnectBtn.setTextSize(15);
        mNativeConnectBtn.setTypeface(Typeface.DEFAULT_BOLD);
        mNativeConnectBtn.setBackgroundColor(Color.parseColor("#06b6d4")); // Aegis Cyan
        mNativeConnectBtn.setPadding(32, 32, 32, 32);
        mNativeConnectBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mIsConnected) {
                    disconnectVpnInternal();
                } else {
                    prepareAndConnectVpn();
                }
            }
        });
        bottomBar.addView(mNativeConnectBtn);

        rootLayout.addView(bottomBar);
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
                            updateUiState(mIsConnected);
                        }
                    });
                } catch (Exception e) {
                    Log.e(TAG, "Backend init exception: " + e.getMessage());
                }
            }
        }).start();

        // Load the Aegis Cloud Portal
        mWebView.loadUrl(PORTAL_URL);
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
            }
        }
    }

    private void connectVpnInternal() {
        mNativeConnectBtn.setEnabled(false);
        mNativeConnectBtn.setText("ENGAGING ENCRYPTED MESH...");
        mNativeStatusText.setText("⚡ Negotiating Noise IK Handshake with Azure Relay...");

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (mBackend == null) {
                        mBackend = new GoBackend(MainActivity.this);
                    }
                    InputStream is = new ByteArrayInputStream(DEFAULT_WG_CONFIG.getBytes(StandardCharsets.UTF_8));
                    Config config = Config.parse(is);

                    mBackend.setState(mTunnel, Tunnel.State.UP, config);
                    mIsConnected = true;

                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            updateUiState(true);
                            Toast.makeText(MainActivity.this, "🛡️ Connected! All apps routed securely.", Toast.LENGTH_SHORT).show();
                            // Reload webview now that tunnel is active
                            mWebView.reload();
                        }
                    });
                } catch (Exception e) {
                    final String err = e.getMessage();
                    Log.e(TAG, "VPN Start Error: " + err, e);
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            mIsConnected = false;
                            updateUiState(false);
                            Toast.makeText(MainActivity.this, "Connection Error: " + err, Toast.LENGTH_LONG).show();
                        }
                    });
                }
            }
        }).start();
    }

    private void disconnectVpnInternal() {
        mNativeConnectBtn.setEnabled(false);
        mNativeConnectBtn.setText("DISCONNECTING...");

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
                            updateUiState(false);
                            Toast.makeText(MainActivity.this, "Aegis Tunnel Disconnected", Toast.LENGTH_SHORT).show();
                        }
                    });
                } catch (Exception e) {
                    Log.e(TAG, "VPN Stop Error: " + e.getMessage(), e);
                    mMainHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            updateUiState(mIsConnected);
                        }
                    });
                }
            }
        }).start();
    }

    private void updateUiState(boolean connected) {
        mIsConnected = connected;
        mNativeConnectBtn.setEnabled(true);
        if (connected) {
            mNativeConnectBtn.setText("DISCONNECT ANONYMOUS INTERNET");
            mNativeConnectBtn.setBackgroundColor(Color.parseColor("#ef4444")); // Red for disconnect
            mNativeConnectBtn.setTextColor(Color.WHITE);
            mNativeStatusText.setText("🟢 ACTIVE: 100% TRAFFIC ROUTED TO AZURE + LAPTOP MESH");
            mNativeStatusText.setTextColor(Color.parseColor("#10b981"));
        } else {
            mNativeConnectBtn.setText("CONNECT TO ANONYMOUS INTERNET");
            mNativeConnectBtn.setBackgroundColor(Color.parseColor("#06b6d4")); // Cyan
            mNativeConnectBtn.setTextColor(Color.parseColor("#050811"));
            mNativeStatusText.setText("🛡️ THE AEGIS PROTOCOL: STANDBY (0 IP LEAK)");
            mNativeStatusText.setTextColor(Color.parseColor("#94a3b8"));
        }
        notifyWebUiState(connected);
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
        public boolean isNative() {
            return true;
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
