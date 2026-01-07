#!/bin/sh
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  CI5 PHOENIX STUB v3.0 (Testing Edition)                                  ║
# ║  curl -sL ci5.run | sh -s free                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
# NOTE: This is the non-fortified testing version. Production will use
#       Nostr consensus + IPFS pinning + signature verification.

set -e

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
CI5_VERSION="3.0.0-testing"
CI5_RAW="https://raw.githubusercontent.com/dreamswag/ci5/main"

# Colors (disabled if not tty)
if [ -t 1 ]; then
    R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'
    B='\033[1m'; N='\033[0m'
else
    R=''; G=''; Y=''; C=''; B=''; N=''
fi

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────
die() { printf "${R}[✗] %s${N}\n" "$1" >&2; exit 1; }
info() { printf "${G}[✓]${N} %s\n" "$1"; }
warn() { printf "${Y}[!]${N} %s\n" "$1"; }
step() { printf "\n${C}═══ %s ═══${N}\n\n" "$1"; }

# ─────────────────────────────────────────────────────────────────────────────
# REQUIREMENTS CHECK
# ─────────────────────────────────────────────────────────────────────────────
check_requirements() {
    [ "$(id -u)" -eq 0 ] || die "Must run as root"
    command -v curl >/dev/null 2>&1 || die "curl required"
}

# ─────────────────────────────────────────────────────────────────────────────
# COMMAND ROUTER
# ─────────────────────────────────────────────────────────────────────────────
resolve_command() {
    case "$1" in
        # Bootstrap installers (route through bootstrap.sh)
        free|"")        echo "BOOTSTRAP:recommended" ;;
        4evr)           echo "BOOTSTRAP:minimal" ;;
        1314)           echo "BOOTSTRAP:custom" ;;

        # Recovery
        heal)           echo "emergency/self_heal.sh" ;;
        rescue)         echo "emergency/force_public_dns.sh" ;;
        sos)            echo "emergency/emergency_recovery.sh" ;;

        # System
        update)         echo "scripts/system/update.sh" ;;
        paranoia)       echo "scripts/system/paranoia_toggle.sh" ;;
        backup)         echo "scripts/system/backup.sh" ;;
        nic)            echo "core/system/nic-tuning.sh" ;;

        # VPN
        mullvad)        echo "scripts/vpn/setup_mullvad.sh" ;;
        tailscale)      echo "scripts/vpn/setup_tailscale.sh" ;;
        hybrid)         echo "scripts/vpn/setup_hybrid.sh" ;;

        # Travel
        travel)         echo "scripts/travel/travel.sh" ;;
        clone)          echo "scripts/travel/clone.sh" ;;

        # Maintenance
        away)           echo "scripts/maintenance/away.sh" ;;
        pure)           echo "scripts/maintenance/pure.sh" ;;

        *)              echo "" ;;
    esac
}

# ─────────────────────────────────────────────────────────────────────────────
# DOWNLOAD & EXECUTE
# ─────────────────────────────────────────────────────────────────────────────
fetch_and_run() {
    local script_path="$1"
    shift

    info "Fetching: $script_path"
    curl -fsSL "${CI5_RAW}/${script_path}" -o /tmp/ci5-exec.sh || \
        die "Failed to download $script_path"

    chmod +x /tmp/ci5-exec.sh
    exec /tmp/ci5-exec.sh "$@"
}

run_bootstrap() {
    local mode="$1"
    shift

    step "CI5 PHOENIX BOOTSTRAP"
    info "Mode: $mode"

    # Fetch bootstrap.sh and pass mode flag
    curl -fsSL "${CI5_RAW}/scripts/bootstrap/bootstrap.sh" -o /tmp/ci5-bootstrap.sh || \
        die "Failed to download bootstrap.sh"

    chmod +x /tmp/ci5-bootstrap.sh
    exec /tmp/ci5-bootstrap.sh "-${mode}" "$@"
}

# ─────────────────────────────────────────────────────────────────────────────
# MENU (Interactive fallback)
# ─────────────────────────────────────────────────────────────────────────────
show_menu() {
    clear
    cat << 'BANNER'
    ╔═══════════════════════════════════════════════════════════════════╗
    ║          CI5 PHOENIX — Pi 5 Sovereign Router Bootstrap            ║
    ║                      Testing Edition v3.0                         ║
    ╚═══════════════════════════════════════════════════════════════════╝
BANNER
    printf "\n"
    printf "    ${B}[1] free${N}  — Recommended (Full stack + Docker + IDS)\n"
    printf "    ${B}[2] 4evr${N}  — Minimal (VLANs + Unbound + SQM, no Docker)\n"
    printf "    ${B}[3] 1314${N}  — Custom (Interactive component selection)\n"
    printf "\n"
    printf "    ─────────────────────────────────────────────────────────────\n"
    printf "    ${C}curl -sL ci5.run | sh -s free${N}     # Direct install\n"
    printf "    ${C}curl -sL ci5.run | sh -s mullvad${N}  # Add-on modules\n"
    printf "\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
main() {
    check_requirements

    # Parse command
    local cmd="${1:-}"
    shift 2>/dev/null || true

    # Direct command execution
    if [ -n "$cmd" ]; then
        local target=$(resolve_command "$cmd")

        [ -z "$target" ] && die "Unknown command: $cmd"

        # Bootstrap commands
        if echo "$target" | grep -q "^BOOTSTRAP:"; then
            local mode=$(echo "$target" | cut -d: -f2)
            run_bootstrap "$mode" "$@"
        fi

        # Regular scripts
        fetch_and_run "$target" "$@"
    fi

    # Interactive menu
    while true; do
        show_menu
        printf "    Select [1-3] or [q]uit: "
        read -r choice
        case "$choice" in
            1|"")   run_bootstrap "recommended" ;;
            2)      run_bootstrap "minimal" ;;
            3)      run_bootstrap "custom" ;;
            q|Q)    exit 0 ;;
            *)      warn "Invalid option" ;;
        esac
    done
}

main "$@"
