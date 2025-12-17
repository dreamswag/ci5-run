#!/bin/bash
# 🚀 Ci5 Bootstrap Installer - Transform Pi OS into Ci5 Router
# Usage: curl -sSL https://ci5.run/bootstrap | sudo bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

REPO_URL="https://github.com/YOUR_USERNAME/ci5.git"
INSTALL_DIR="/opt/ci5"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 Ci5 Bootstrap Installer                                    ║"
echo "║  Native Raspberry Pi OS → 0ms Router in 14.7~ minutes          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────────────────────────────
# COMPATIBILITY CHECK
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[1/8] System Compatibility Check...${NC}"

# Must be Raspberry Pi 5
if ! grep -qE "Raspberry Pi 5" /proc/cpuinfo; then
    echo -e "${RED}❌ This requires Raspberry Pi 5${NC}"
    echo "   Detected: $(grep "Model" /proc/cpuinfo | cut -d: -f2)"
    exit 1
fi

# Must be running Debian-based OS
if [ ! -f /etc/debian_version ]; then
    echo -e "${RED}❌ This requires Debian-based OS (Raspberry Pi OS / Ubuntu)${NC}"
    exit 1
fi

# Must be ARM64
if [ "$(uname -m)" != "aarch64" ]; then
    echo -e "${RED}❌ This requires 64-bit ARM (aarch64)${NC}"
    exit 1
fi

# Must be root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Must run as root${NC}"
    echo "   Try: curl -sSL https://ci5.run/bootstrap | sudo bash"
    exit 1
fi

# RAM check
TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM_MB" -lt 3500 ]; then
    echo -e "${RED}❌ Insufficient RAM: ${TOTAL_RAM_MB}MB (Need 4GB+)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Raspberry Pi 5 detected ($(free -h | awk '/^Mem:/{print $2}') RAM)${NC}"

# ─────────────────────────────────────────────────────────────
# WARNING - DESTRUCTIVE OPERATION
# ─────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  ⚠️  WARNING: DESTRUCTIVE TRANSFORMATION                       ║${NC}"
echo -e "${YELLOW}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  This will:                                                    ║${NC}"
echo -e "${YELLOW}║  • Replace network configuration (goodbye NetworkManager)     ║${NC}"
echo -e "${YELLOW}║  • Disable Pi OS desktop/GUI services                         ║${NC}"
echo -e "${YELLOW}║  • Install OpenWrt-style networking (VLANs, firewall)         ║${NC}"
echo -e "${YELLOW}║  • Convert this Pi into a ROUTER (not a desktop)              ║${NC}"
echo -e "${YELLOW}║                                                                ║${NC}"
echo -e "${YELLOW}║  ⚠️  This Pi will LOSE its current network config!            ║${NC}"
echo -e "${YELLOW}║  ⚠️  You'll need to reconnect via new IP (192.168.99.1)       ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Type 'TRANSFORM' to proceed:${NC} "
read -r CONFIRM

if [ "$CONFIRM" != "TRANSFORM" ]; then
    echo -e "${RED}Aborted by user.${NC}"
    exit 0
fi

# ─────────────────────────────────────────────────────────────
# DEPENDENCY INSTALLATION
# ─────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[2/8] Installing Dependencies...${NC}"

# Update package lists
apt-get update -qq

# Core dependencies
PACKAGES=(
    git curl wget
    python3 python3-pip python3-venv
    iptables nftables bridge-utils vlan
    dnsmasq unbound
    ethtool iproute2 net-tools
    docker.io docker-compose
    tc iw hostapd
)

echo "   Installing: ${PACKAGES[@]}"
DEBIAN_FRONTEND=noninteractive apt-get install -y "${PACKAGES[@]}" > /dev/null 2>&1

# Install speedtest-cli
pip3 install --break-system-packages speedtest-cli > /dev/null 2>&1

echo -e "${GREEN}✓ Dependencies installed${NC}"

# ─────────────────────────────────────────────────────────────
# CLONE CI5 REPOSITORY
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[3/8] Downloading Ci5 Configuration...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo "   Existing installation found - backing up..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}.bak.$(date +%s)"
fi

git clone -q "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${GREEN}✓ Ci5 repository cloned${NC}"

# ─────────────────────────────────────────────────────────────
# NETWORK TRANSFORMATION
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[4/8] Transforming Network Stack...${NC}"

# Disable NetworkManager and systemd-networkd
systemctl stop NetworkManager 2>/dev/null || true
systemctl disable NetworkManager 2>/dev/null || true
systemctl stop systemd-networkd 2>/dev/null || true
systemctl disable systemd-networkd 2>/dev/null || true

# Install netplan-style configuration (Debian 12+)
cat > /etc/netplan/01-ci5-base.yaml << 'NETPLAN'
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      dhcp6: no
    eth1:
      dhcp4: yes
      dhcp6: no
  bridges:
    br-lan:
      interfaces: [eth0]
      dhcp4: no
      addresses: [192.168.99.1/24]
      routes:
        - to: default
          via: 192.168.99.1
      nameservers:
        addresses: [127.0.0.1]
  vlans:
    eth0.10:
      id: 10
      link: eth0
      addresses: [10.10.10.1/24]
    eth0.30:
      id: 30
      link: eth0
      addresses: [10.10.30.1/24]
    eth0.40:
      id: 40
      link: eth0
      addresses: [10.10.40.1/24]
NETPLAN

# Apply network config
netplan generate
netplan apply

echo -e "${GREEN}✓ Network stack transformed${NC}"

# ─────────────────────────────────────────────────────────────
# FIREWALL SETUP (nftables)
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[5/8] Configuring Firewall...${NC}"

cat > /etc/nftables.conf << 'NFTABLES'
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        
        # Accept loopback
        iif lo accept
        
        # Accept established connections
        ct state established,related accept
        
        # Accept ICMP
        ip protocol icmp accept
        
        # Accept SSH from LAN/VLANs
        iifname { "br-lan", "eth0.10", "eth0.30", "eth0.40" } tcp dport 22 accept
        
        # Accept DNS from LAN/VLANs
        iifname { "br-lan", "eth0.10", "eth0.30", "eth0.40" } { tcp dport 53, udp dport 53 } accept
        
        # Accept DHCP
        udp dport 67 accept
    }
    
    chain forward {
        type filter hook forward priority 0; policy drop;
        
        # Accept established connections
        ct state established,related accept
        
        # LAN → WAN
        iifname { "br-lan", "eth0.10", "eth0.30", "eth0.40" } oifname "eth1" accept
        
        # IoT/Guest isolation
        iifname "eth0.30" oifname { "br-lan", "eth0.10" } drop
        iifname "eth0.40" oifname { "br-lan", "eth0.10", "eth0.30" } drop
    }
    
    chain output {
        type filter hook output priority 0; policy accept;
    }
}

table ip nat {
    chain postrouting {
        type nat hook postrouting priority 100; policy accept;
        oifname "eth1" masquerade
    }
}
NFTABLES

systemctl enable nftables
systemctl start nftables

echo -e "${GREEN}✓ Firewall configured${NC}"

# ─────────────────────────────────────────────────────────────
# DNS SETUP (Unbound + dnsmasq)
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[6/8] Configuring DNS...${NC}"

# Unbound configuration
cat > /etc/unbound/unbound.conf.d/ci5.conf << 'UNBOUND'
server:
    interface: 127.0.0.1@5335
    interface: ::1@5335
    access-control: 127.0.0.0/8 allow
    do-ip4: yes
    do-ip6: no
    do-udp: yes
    do-tcp: yes
    hide-identity: yes
    hide-version: yes
    minimal-responses: yes
    prefetch: yes
    qname-minimisation: yes
    rrset-roundrobin: yes
    use-caps-for-id: no
UNBOUND

# dnsmasq configuration (DHCP + DNS forwarding)
cat > /etc/dnsmasq.d/ci5.conf << 'DNSMASQ'
# Listen on specific interfaces
interface=br-lan
interface=eth0.10
interface=eth0.30
interface=eth0.40
bind-interfaces

# DHCP ranges
dhcp-range=tag:lan,192.168.99.100,192.168.99.200,24h
dhcp-range=tag:trusted,10.10.10.100,10.10.10.200,24h
dhcp-range=tag:iot,10.10.30.100,10.10.30.200,24h
dhcp-range=tag:guest,10.10.40.100,10.10.40.200,24h

# DNS options
dhcp-option=tag:lan,6,192.168.99.1
dhcp-option=tag:trusted,6,10.10.10.1
dhcp-option=tag:iot,6,10.10.30.1
dhcp-option=tag:guest,6,10.10.40.1

# Upstream DNS (Unbound)
server=127.0.0.1#5335
no-resolv
DNSMASQ

systemctl enable unbound dnsmasq
systemctl restart unbound dnsmasq

echo -e "${GREEN}✓ DNS configured${NC}"

# ─────────────────────────────────────────────────────────────
# KERNEL TUNING
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[7/8] Kernel Tuning...${NC}"

cat >> /etc/sysctl.conf << 'SYSCTL'
# Ci5 Network Tuning
net.ipv4.ip_forward=1
net.ipv4.conf.all.forwarding=1
net.ipv6.conf.all.forwarding=1
net.core.default_qdisc=fq_codel
net.ipv4.tcp_congestion_control=bbr
net.core.rmem_max=16777216
net.core.wmem_max=16777216
net.ipv4.tcp_rmem=4096 87380 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.netfilter.nf_conntrack_max=131072
SYSCTL

sysctl -p > /dev/null

echo -e "${GREEN}✓ Kernel tuned${NC}"

# ─────────────────────────────────────────────────────────────
# SETUP WIZARD PREPARATION
# ─────────────────────────────────────────────────────────────
echo -e "${CYAN}[8/8] Finalizing...${NC}"

# Create auto-launch script for setup wizard
cat > /root/.bash_profile << 'PROFILE'
if [ -f /opt/ci5/.needs-setup ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  🎯 Ci5 Setup Wizard Required                                  ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    cd /opt/ci5 && sh setup.sh && rm /opt/ci5/.needs-setup
fi
PROFILE

touch /opt/ci5/.needs-setup

# ─────────────────────────────────────────────────────────────
# COMPLETION
# ─────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ CI5 BOOTSTRAP COMPLETE                                     ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  System will reboot in 10 seconds...                          ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  After reboot:                                                ║${NC}"
echo -e "${GREEN}║  1. Reconnect: ssh root@192.168.99.1                         ║${NC}"
echo -e "${GREEN}║  2. Setup wizard will launch automatically                   ║${NC}"
echo -e "${GREEN}║  3. Answer 5 questions (WAN, ISP, Wi-Fi passwords)           ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  ⚠️  Your current SSH session will disconnect!                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Countdown
for i in 10 9 8 7 6 5 4 3 2 1; do
    echo -ne "\rRebooting in ${i} seconds... (Ctrl+C to cancel)"
    sleep 1
done

echo ""
reboot