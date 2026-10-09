#!/bin/bash
# ==============================================================================
# THE AEGIS PROTOCOL — WIREGUARD 24/7 CLOUD RELAY PROVISIONER
# Configures WireGuard kernel server on Ubuntu Azure VM (172.209.217.140)
# Enables IP forwarding, NAT masquerade, and provisions Mobile Peer
# ==============================================================================

set -e

echo "🛡️  [Aegis Cloud] Installing & Configuring WireGuard 24/7 Tunnel Server..."

# 1. Install WireGuard & Networking tools
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y wireguard wireguard-tools iptables-persistent qrencode curl

# 2. Enable Kernel IP forwarding & Google BBR fast-path
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-wireguard-forward.conf
echo "net.ipv6.conf.all.forwarding = 1" >> /etc/sysctl.d/99-wireguard-forward.conf
echo "net.core.default_qdisc = fq" >> /etc/sysctl.d/99-wireguard-forward.conf
echo "net.ipv4.tcp_congestion_control = bbr" >> /etc/sysctl.d/99-wireguard-forward.conf
sysctl --system

# 3. Detect default network interface (e.g., eth0)
ETH_INT=$(ip route | grep default | awk '{print $5}' | head -n1)
if [ -z "$ETH_INT" ]; then
    ETH_INT="eth0"
fi
echo "⚡ Default egress network interface detected: $ETH_INT"

# 4. Configure WireGuard Server (/etc/wireguard/wg0.conf)
mkdir -p /etc/wireguard
chmod 700 /etc/wireguard

cat << 'EOF' > /etc/wireguard/wg0.conf
[Interface]
Address = 10.66.66.1/24
ListenPort = 51820
PrivateKey = aDuOdHc6OnxAmfNTKAEFSQfqXnS2pZ5iGDqodxc1NUA=
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -s 10.66.66.0/24 -o __ETH__ -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -s 10.66.66.0/24 -o __ETH__ -j MASQUERADE

[Peer]
# Mobile Client Peer (Town / Anywhere Mode)
PublicKey = W93w3iiv048TxN6g5ar+YHnX0wdIF0fHxUlUvWiXtGM=
AllowedIPs = 10.66.66.2/32
EOF

sed -i "s/__ETH__/$ETH_INT/g" /etc/wireguard/wg0.conf
chmod 600 /etc/wireguard/wg0.conf

# 5. Start & Enable WireGuard wg0 Service
systemctl stop wg-quick@wg0 2>/dev/null || true
systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0

# 6. Generate Mobile Client Configuration File
cat << 'EOF' > /root/aegis-mobile.conf
[Interface]
PrivateKey = OFZmrh2n9ATyqyBDvTSLzWZcQ7yEHmqpV+VRQ99ZEUI=
Address = 10.66.66.2/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = 73qDgl+OL2zLEXOq03Q+oW3NWb1HoXETCLYMGqPeChY=
Endpoint = 172.209.217.140:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF
chmod 644 /root/aegis-mobile.conf

echo "=============================================================================="
echo "🎉 WIREGUARD 24/7 CLOUD RELAY SERVER IS NOW ACTIVE!"
echo "=============================================================================="
echo "Server Endpoint: 172.209.217.140:51820 (UDP)"
echo "Internal Subnet: 10.66.66.0/24"
echo "Mobile Client IP: 10.66.66.2"
echo ""
echo "📱 Mobile Client Configuration saved at: /root/aegis-mobile.conf"
echo ""
echo "Scan the QR code below directly with the WireGuard App on your phone:"
echo "=============================================================================="
qrencode -t ansiutf8 < /root/aegis-mobile.conf
echo "=============================================================================="
wg show
