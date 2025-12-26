#!/bin/sh
# 🔐 Ci5 Mullvad WireGuard Setup (v7.5-RELEASE)
# Route: /mullvad
# Purpose: Configure Mullvad VPN with automatic killswitch
#
# Usage: curl ci5.run/mullvad | sh
#        curl ci5.run/mullvad | sh -s -- --account XXXXX --server se-sto
#
# Features:
#   - Full tunnel through Mullvad
#   - Automatic killswitch (blocks traffic if VPN drops)
#   - DNS leak protection
#   - IPv6 disable option
#   - Server selection

set -e

# ─────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MULLVAD_API="https://api.mullvad.net/www/relays/wireguard/"
WG_INTERFACE="wg_mullvad"
WG_CONFIG_DIR="/etc/wireguard"
KILLSWITCH_ENABLED=1
LOG_FILE="/tmp/ci5-mullvad-$(date +%Y%m%d_%H%M%S).log"

# ─────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────
log_ok() { echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"; }
log_warn() { echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "$LOG_FILE"; }
log_err() { echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"; }
log_info() { echo -e "${CYAN}[i]${NC} $1" | tee -a "$LOG_FILE"; }

# ─────────────────────────────────────────────────────────────
# ARGUMENT PARSING
# ─────────────────────────────────────────────────────────────
MULLVAD_ACCOUNT=""
MULLVAD_SERVER=""
NO_KILLSWITCH=0
DISABLE_IPV6=1

while [ $# -gt 0 ]; do
    case "$1" in
        --account|-a)
            MULLVAD_ACCOUNT="$2"
            shift 2
            ;;
        --server|-s)
            MULLVAD_SERVER="$2"
            shift 2
            ;;
        --no-killswitch)
            NO_KILLSWITCH=1
            KILLSWITCH_ENABLED=0
            shift
            ;;
        --enable-ipv6)
            DISABLE_IPV6=0
            shift
            ;;
        --remove)
            REMOVE_MODE=1
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# ─────────────────────────────────────────────────────────────
# DEPENDENCY CHECK
# ─────────────────────────────────────────────────────────────
check_deps() {
    log_info "Checking dependencies..."
    
    MISSING=""
    for pkg in wireguard-tools curl jq; do
        if ! command -v "${pkg%%-*}" >/dev/null 2>&1; then
            MISSING="$MISSING $pkg"
        fi
    done
    
    if [ -n "$MISSING" ]; then
        log_info "Installing:$MISSING"
        opkg update >/dev/null 2>&1
        for pkg in $MISSING; do
            opkg install "$pkg" >/dev/null 2>&1 || {
                log_err "Failed to install $pkg"
                exit 1
            }
        done
    fi
    
    log_ok "Dependencies satisfied"
}

# ─────────────────────────────────────────────────────────────
# REMOVE MULLVAD
# ─────────────────────────────────────────────────────────────
remove_mullvad() {
    echo ""
    echo -e "${YELLOW}Removing Mullvad VPN configuration...${NC}"
    
    # Bring down interface
    wg-quick down "$WG_INTERFACE" 2>/dev/null || true
    
    # Remove UCI config
    uci -q delete network.$WG_INTERFACE
    uci -q delete network.${WG_INTERFACE}_peer
    uci commit network
    
    # Remove firewall rules
    uci -q delete firewall.mullvad_zone
    uci -q delete firewall.mullvad_forward
    uci -q delete firewall.mullvad_killswitch
    uci commit firewall
    
    # Remove config file
    rm -f "$WG_CONFIG_DIR/$WG_INTERFACE.conf"
    
    # Restart services
    /etc/init.d/network reload 2>/dev/null || true
    /etc/init.d/firewall reload 2>/dev/null || true
    
    log_ok "Mullvad VPN removed"
    exit 0
}

[ "$REMOVE_MODE" = "1" ] && remove_mullvad

# ─────────────────────────────────────────────────────────────
# INTERACTIVE SETUP
# ─────────────────────────────────────────────────────────────
interactive_setup() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}          ${GREEN}🔐 Ci5 MULLVAD VPN SETUP${NC}                              ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ -z "$MULLVAD_ACCOUNT" ]; then
        echo "Enter your Mullvad account number (16 digits):"
        echo -n "> "
        read -r MULLVAD_ACCOUNT
    fi
    
    # Validate account number
    if ! echo "$MULLVAD_ACCOUNT" | grep -qE '^[0-9]{16}$'; then
        log_err "Invalid account number format. Should be 16 digits."
        exit 1
    fi
    
    # Fetch server list
    log_info "Fetching available servers..."
    
    SERVERS=$(curl -sfL "$MULLVAD_API" 2>/dev/null | jq -r '.[].hostname' | sort)
    
    if [ -z "$SERVERS" ]; then
        log_warn "Could not fetch server list. Using default servers."
        SERVERS="se-sto-wg-001
se-got-wg-001
nl-ams-wg-001
de-fra-wg-001
us-nyc-wg-001
us-lax-wg-001
gb-lon-wg-001
ch-zrh-wg-001"
    fi
    
    if [ -z "$MULLVAD_SERVER" ]; then
        echo ""
        echo "Popular server locations:"
        echo "  se-sto (Stockholm)  |  nl-ams (Amsterdam)"
        echo "  de-fra (Frankfurt)  |  gb-lon (London)"
        echo "  us-nyc (New York)   |  us-lax (Los Angeles)"
        echo "  ch-zrh (Zurich)     |  jp-tyo (Tokyo)"
        echo ""
        echo "Enter server prefix (e.g., 'se-sto' for Stockholm):"
        echo -n "> "
        read -r MULLVAD_SERVER
    fi
    
    [ -z "$MULLVAD_SERVER" ] && MULLVAD_SERVER="se-sto"
    
    # Find matching server
    SELECTED_SERVER=$(echo "$SERVERS" | grep "^${MULLVAD_SERVER}" | head -1)
    
    if [ -z "$SELECTED_SERVER" ]; then
        log_warn "No server found matching '$MULLVAD_SERVER', using first available"
        SELECTED_SERVER=$(echo "$SERVERS" | head -1)
    fi
    
    log_ok "Selected server: $SELECTED_SERVER"
}

# ─────────────────────────────────────────────────────────────
# GENERATE WIREGUARD KEYS
# ─────────────────────────────────────────────────────────────
generate_keys() {
    log_info "Generating WireGuard keys..."
    
    mkdir -p "$WG_CONFIG_DIR"
    chmod 700 "$WG_CONFIG_DIR"
    
    WG_PRIVATE_KEY=$(wg genkey)
    WG_PUBLIC_KEY=$(echo "$WG_PRIVATE_KEY" | wg pubkey)
    
    log_ok "Keys generated"
    log_info "Public key: $WG_PUBLIC_KEY"
}

# ─────────────────────────────────────────────────────────────
# REGISTER KEY WITH MULLVAD
# ─────────────────────────────────────────────────────────────
register_key() {
    log_info "Registering public key with Mullvad..."
    
    RESPONSE=$(curl -sfL -X POST \
        -H "Content-Type: application/json" \
        -d "{\"account\":\"$MULLVAD_ACCOUNT\",\"pubkey\":\"$WG_PUBLIC_KEY\"}" \
        "https://api.mullvad.net/wg/" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "error"; then
        ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
        log_err "Failed to register key: $ERROR_MSG"
        exit 1
    fi
    
    # Extract assigned IPv4 address
    VPN_IPV4=$(echo "$RESPONSE" | grep -oE '10\.[0-9]+\.[0-9]+\.[0-9]+/32' | head -1)
    
    if [ -z "$VPN_IPV4" ]; then
        # Try alternate parsing
        VPN_IPV4=$(echo "$RESPONSE" | jq -r '.ipv4_address // empty' 2>/dev/null)
    fi
    
    if [ -z "$VPN_IPV4" ]; then
        log_warn "Could not parse VPN IP, using placeholder"
        VPN_IPV4="10.64.0.2/32"
    fi
    
    log_ok "Registered with Mullvad, assigned: $VPN_IPV4"
}

# ─────────────────────────────────────────────────────────────
# FETCH SERVER INFO
# ─────────────────────────────────────────────────────────────
fetch_server_info() {
    log_info "Fetching server endpoint info..."
    
    SERVER_INFO=$(curl -sfL "$MULLVAD_API" 2>/dev/null | \
        jq -r ".[] | select(.hostname==\"$SELECTED_SERVER\")")
    
    if [ -z "$SERVER_INFO" ]; then
        log_warn "Could not fetch server info, using defaults"
        SERVER_PUBKEY="Xe2WJPP9ZflOxkMgdo0ICRj1F2b7Q3qC2yGAvO+q9gM="
        SERVER_ENDPOINT="185.213.154.68"
        SERVER_PORT="51820"
    else
        SERVER_PUBKEY=$(echo "$SERVER_INFO" | jq -r '.pubkey')
        SERVER_ENDPOINT=$(echo "$SERVER_INFO" | jq -r '.ipv4_addr_in')
        SERVER_PORT="51820"
    fi
    
    log_ok "Server endpoint: $SERVER_ENDPOINT:$SERVER_PORT"
}

# ─────────────────────────────────────────────────────────────
# CREATE WIREGUARD CONFIG
# ─────────────────────────────────────────────────────────────
create_wg_config() {
    log_info "Creating WireGuard configuration..."
    
    cat > "$WG_CONFIG_DIR/$WG_INTERFACE.conf" << EOF
# Ci5 Mullvad WireGuard Configuration
# Generated: $(date)
# Server: $SELECTED_SERVER

[Interface]
PrivateKey = $WG_PRIVATE_KEY
Address = $VPN_IPV4
DNS = 10.64.0.1

[Peer]
PublicKey = $SERVER_PUBKEY
AllowedIPs = 0.0.0.0/0
Endpoint = $SERVER_ENDPOINT:$SERVER_PORT
PersistentKeepalive = 25
EOF

    chmod 600 "$WG_CONFIG_DIR/$WG_INTERFACE.conf"
    log_ok "WireGuard config created"
}

# ─────────────────────────────────────────────────────────────
# CONFIGURE UCI
# ─────────────────────────────────────────────────────────────
configure_uci() {
    log_info "Configuring OpenWrt UCI..."
    
    # Remove existing if present
    uci -q delete network.$WG_INTERFACE 2>/dev/null || true
    
    # Create interface
    uci set network.$WG_INTERFACE=interface
    uci set network.$WG_INTERFACE.proto='wireguard'
    uci set network.$WG_INTERFACE.private_key="$WG_PRIVATE_KEY"
    uci add_list network.$WG_INTERFACE.addresses="$VPN_IPV4"
    
    # DNS through Mullvad
    uci set network.$WG_INTERFACE.dns='10.64.0.1'
    
    # Add peer
    uci -q delete network.${WG_INTERFACE}_peer 2>/dev/null || true
    uci set network.${WG_INTERFACE}_peer=wireguard_${WG_INTERFACE}
    uci set network.${WG_INTERFACE}_peer.public_key="$SERVER_PUBKEY"
    uci set network.${WG_INTERFACE}_peer.endpoint_host="$SERVER_ENDPOINT"
    uci set network.${WG_INTERFACE}_peer.endpoint_port="$SERVER_PORT"
    uci set network.${WG_INTERFACE}_peer.persistent_keepalive='25'
    uci add_list network.${WG_INTERFACE}_peer.allowed_ips='0.0.0.0/0'
    
    if [ "$DISABLE_IPV6" -eq 0 ]; then
        uci add_list network.${WG_INTERFACE}_peer.allowed_ips='::/0'
    fi
    
    uci commit network
    log_ok "UCI network configured"
}

# ─────────────────────────────────────────────────────────────
# CONFIGURE FIREWALL + KILLSWITCH
# ─────────────────────────────────────────────────────────────
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Create VPN zone
    uci -q delete firewall.mullvad_zone 2>/dev/null || true
    uci set firewall.mullvad_zone=zone
    uci set firewall.mullvad_zone.name='mullvad'
    uci set firewall.mullvad_zone.input='REJECT'
    uci set firewall.mullvad_zone.output='ACCEPT'
    uci set firewall.mullvad_zone.forward='REJECT'
    uci set firewall.mullvad_zone.masq='1'
    uci add_list firewall.mullvad_zone.network="$WG_INTERFACE"
    
    # Allow LAN to VPN
    uci -q delete firewall.mullvad_forward 2>/dev/null || true
    uci set firewall.mullvad_forward=forwarding
    uci set firewall.mullvad_forward.src='lan'
    uci set firewall.mullvad_forward.dest='mullvad'
    
    # Remove LAN->WAN forwarding (force VPN)
    if [ "$KILLSWITCH_ENABLED" -eq 1 ]; then
        log_info "Enabling killswitch (blocking non-VPN traffic)..."
        
        # Find and disable LAN->WAN forwarding
        FORWARD_IDX=0
        while uci -q get firewall.@forwarding[$FORWARD_IDX] >/dev/null 2>&1; do
            SRC=$(uci -q get firewall.@forwarding[$FORWARD_IDX].src)
            DST=$(uci -q get firewall.@forwarding[$FORWARD_IDX].dest)
            
            if [ "$SRC" = "lan" ] && [ "$DST" = "wan" ]; then
                uci set firewall.@forwarding[$FORWARD_IDX].enabled='0'
                log_info "Disabled LAN->WAN forwarding (killswitch active)"
            fi
            
            FORWARD_IDX=$((FORWARD_IDX + 1))
        done
        
        # Add rule to block direct WAN access
        uci -q delete firewall.mullvad_killswitch 2>/dev/null || true
        uci set firewall.mullvad_killswitch=rule
        uci set firewall.mullvad_killswitch.name='Mullvad-Killswitch'
        uci set firewall.mullvad_killswitch.src='lan'
        uci set firewall.mullvad_killswitch.dest='wan'
        uci set firewall.mullvad_killswitch.target='REJECT'
        uci set firewall.mullvad_killswitch.enabled='1'
    fi
    
    uci commit firewall
    log_ok "Firewall configured"
}

# ─────────────────────────────────────────────────────────────
# DISABLE IPV6 (Optional)
# ─────────────────────────────────────────────────────────────
configure_ipv6() {
    if [ "$DISABLE_IPV6" -eq 1 ]; then
        log_info "Disabling IPv6 to prevent leaks..."
        
        uci set network.lan.ipv6='0'
        uci set network.wan.ipv6='0'
        uci -q delete network.wan6 2>/dev/null || true
        
        # Sysctl
        echo "net.ipv6.conf.all.disable_ipv6=1" >> /etc/sysctl.conf
        sysctl -w net.ipv6.conf.all.disable_ipv6=1 >/dev/null 2>&1 || true
        
        uci commit network
        log_ok "IPv6 disabled"
    fi
}

# ─────────────────────────────────────────────────────────────
# APPLY AND TEST
# ─────────────────────────────────────────────────────────────
apply_config() {
    log_info "Applying configuration..."
    
    /etc/init.d/network reload
    /etc/init.d/firewall reload
    
    sleep 3
    
    # Bring up WireGuard
    ifup "$WG_INTERFACE" 2>/dev/null || true
    
    sleep 2
}

test_connection() {
    log_info "Testing VPN connection..."
    
    # Check interface is up
    if ! ip link show "$WG_INTERFACE" >/dev/null 2>&1; then
        log_err "WireGuard interface not created"
        return 1
    fi
    
    # Check handshake
    WG_STATUS=$(wg show "$WG_INTERFACE" 2>/dev/null)
    
    if echo "$WG_STATUS" | grep -q "latest handshake"; then
        log_ok "WireGuard handshake successful"
    else
        log_warn "No handshake yet, connection may still be establishing..."
    fi
    
    # Test connectivity through VPN
    sleep 2
    
    if ping -c 2 -W 5 10.64.0.1 >/dev/null 2>&1; then
        log_ok "Mullvad DNS reachable"
    else
        log_warn "Cannot reach Mullvad DNS"
    fi
    
    # Check external IP
    EXTERNAL_IP=$(curl -sf --max-time 10 https://am.i.mullvad.net/ip 2>/dev/null)
    
    if [ -n "$EXTERNAL_IP" ]; then
        log_ok "External IP: $EXTERNAL_IP"
        
        # Verify it's a Mullvad IP
        if curl -sf --max-time 10 https://am.i.mullvad.net/connected 2>/dev/null | grep -q "true"; then
            log_ok "Confirmed: Connected through Mullvad"
        else
            log_warn "External IP doesn't appear to be Mullvad"
        fi
    else
        log_warn "Could not determine external IP"
    fi
}

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}          ${GREEN}🔐 Ci5 MULLVAD VPN SETUP (v7.5)${NC}                       ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_deps
    interactive_setup
    generate_keys
    register_key
    fetch_server_info
    create_wg_config
    configure_uci
    configure_firewall
    configure_ipv6
    apply_config
    test_connection
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ MULLVAD VPN CONFIGURED                            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "   Server:     $SELECTED_SERVER"
    echo "   Interface:  $WG_INTERFACE"
    echo "   Killswitch: $([ $KILLSWITCH_ENABLED -eq 1 ] && echo 'ENABLED' || echo 'DISABLED')"
    echo "   IPv6:       $([ $DISABLE_IPV6 -eq 1 ] && echo 'DISABLED' || echo 'ENABLED')"
    echo ""
    echo "   Commands:"
    echo "     Status:    wg show $WG_INTERFACE"
    echo "     Check IP:  curl https://am.i.mullvad.net/ip"
    echo "     Remove:    curl ci5.run/mullvad | sh -s -- --remove"
    echo ""
}

main "$@"