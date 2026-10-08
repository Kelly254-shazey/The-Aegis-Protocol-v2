#!/bin/bash
# ==============================================================================
# THE AEGIS PROTOCOL — 1-CLICK CLOUD VPS SETUP SCRIPT
# Run this on a fresh Ubuntu 22.04 or 24.04 VPS (DigitalOcean, AWS, Linode, Hetzner)
# Usage: sudo bash setup-vps.sh
# ==============================================================================

set -e

echo "🛡️  [Aegis Cloud] Starting 1-Click Cloud VPS Provisioning..."

# 1. Update OS & Install Core Networking Tools
echo "📦 [1/5] Updating packages and installing wireguard, iptables, curl..."
apt-get update -y
apt-get install -y wireguard iptables-persistent curl ca-certificates gnupg

# 2. Kernel Tuning: Enable IPv4 Forwarding & Google BBR Fast Path
echo "⚡ [2/5] Tuning Linux kernel for High-Speed Routing & BBR..."
cat << 'EOF' >> /etc/sysctl.conf
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
EOF
sysctl -p

# 3. Configure NAT Masquerading (Hides Client IPs behind Cloud VPS)
echo "🔒 [3/5] Setting up iptables NAT Masquerade (Real IP Stripping)..."
ETH_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
iptables -t nat -A POSTROUTING -o "$ETH_INTERFACE" -j MASQUERADE
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -j ACCEPT
netfilter-persistent save

# 4. Install Docker & Docker Compose if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 [4/5] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 5. Launch Aegis Captive Portal & Automated SSL Reverse Proxy
echo "🚀 [5/5] Launching Aegis 24/7 Cloud Gateway & Portal..."
cd "$(dirname "$0")"
docker compose up -d --build

SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

echo ""
echo "=============================================================================="
echo "🎉 AEGIS CLOUD GATEWAY SUCCESSFULLY DEPLOYED & LIVE 24/7!"
echo "=============================================================================="
echo "🌐 Public Server IP:       $SERVER_IP"
echo "📱 Hotspot Captive Portal: http://$SERVER_IP:3888"
echo "🔒 Anonymity WireGuard:    UDP Port 51820"
echo "⚡ Status:                  Always-On (Auto-restarts on reboot or crash)"
echo "=============================================================================="
echo "Next step: In Aegis Admin Console -> Cloud & Wi-Fi Routers tab,"
echo "add router and paste the generated config into your Wi-Fi router."
echo "=============================================================================="
