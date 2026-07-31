# The Aegis Protocol

A secure P2P mesh network protocol and internet sharing application.

## Features
- P2P Connectivity across NAT (Hyperswarm DHT)
- Internet Proxying / Gateway Sharing (SOCKS5/TUN)
- Smart Auto-Switch to lowest latency provider
- Secure device pairing via QR codes and invite links
- Cross-platform Electron/React desktop client

## Development

```bash
# Install dependencies
npm install

# Run the app locally
npm run dev

# Build for production
npm run build
```

## Structure
- `src/main`: Electron main process and core protocol logic.
- `src/renderer`: React frontend (Vite), Design System, and Dashboard.
- `src/preload`: ContextBridge for IPC.
