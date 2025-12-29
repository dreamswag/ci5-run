/**
 * CI5.RUN - Compact Directory
 * v8.0-RELEASE (Unified Verification)
 */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const toast = document.getElementById('toast');
    const terminal = document.querySelector('.terminal');

    // Define colors for categories
    const CAT_COLORS = {
        // Bootstrap (green)
        free: 'green', '4evr': 'green', '1314': 'green',
        // Recovery (cyan)
        heal: 'cyan', rescue: 'cyan', status: 'cyan',
        // System (white)
        paranoia: 'white', backup: 'white', update: 'white',
        // Local (dim)
        self: 'dim', fast: 'dim', true: 'dim',
        // Maintenance (red)
        away: 'red', pure: 'red', wipe: 'red',
        // VPN (purple)
        mullvad: 'purple', tailscale: 'purple', hybrid: 'purple',
        // Travel (orange)
        travel: 'orange', clone: 'orange', focus: 'orange',
        // Monitoring (yellow)
        alert: 'yellow', ddns: 'yellow', gsense: 'yellow'
    };

    const COMMANDS = {
        // 🚀 BOOTSTRAP
        free: { 
            cmd: 'curl -sL ci5.run | sh -s free', 
            summary: 'Install Full Stack',
            desc: '[Docker: Suricata IDS, AdGuard Home, CrowdSec, Ntopng & Redis, and Homepage. Maximum security & monitoring.]' 
        },
        '4evr': { 
            cmd: 'curl -sL ci5.run | sh -s 4evr', 
            summary: 'Install Lite Stack',
            desc: '[No Docker. Kernel Hardening, Firewall Zones, Unbound DNS, and CAKE SQM. Maximum routing efficiency.]' 
        },
        '1314': { 
            cmd: 'curl -sL ci5.run | sh -s 1314', 
            summary: 'Custom Installation',
            desc: '[Interactive installer. Choose which components to install. Full control over your stack.]' 
        },
        
        // 🛡️ RECOVERY
        heal: { 
            cmd: 'curl -sL ci5.run | sh -s heal', 
            summary: 'System Integrity Repair',
            desc: '[Verifies local scripts against trusted server checksums. Automatically restores missing or corrupted files to fix broken systems.]' 
        },
        rescue: { 
            cmd: 'curl -sL ci5.run | sh -s rescue', 
            summary: 'Emergency DNS Bypass',
            desc: '[Forces the router to use public resolvers (1.1.1.1) to restore internet access when local DNS fails but connection is active.]' 
        },
        status: { 
            cmd: 'curl -sL ci5.run | sh -s status', 
            summary: 'Quick Health Check',
            desc: '[Runs a simplified pass/fail diagnostic on internet connectivity, firewall rules, and services. Useful for a quick status verification.]' 
        },
        
        // ⚙️ SYSTEM
        paranoia: { 
            cmd: 'curl -sL ci5.run | sh -s paranoia', 
            summary: '[SURICATA] IDS Dead-Man Switch',
            desc: '[Monitors Suricata Intrusion Detection. If the scanner dies, it kills the internet connection to ensure no un-scanned traffic.]' 
        },
        backup: { 
            cmd: 'curl -sL ci5.run | sh -s backup', 
            summary: 'Hardware-Locked Export',
            desc: '[Creates an encrypted config backup bound to this specific device\'s hardware ID. Cannot be decrypted on any other router.]' 
        },
        update: { 
            cmd: 'curl -sL ci5.run | sh -s update', 
            summary: 'Secure Self-Update',
            desc: '[Fetches latest scripts with GPG signature verification. Includes a rollback checkpoint to revert changes if the update fails.]' 
        },
        
        // 🔧 LOCAL
        self: { 
            cmd: 'sh bone_marrow.sh', 
            summary: 'Deep System Diagnostic',
            desc: '[Generates a comprehensive report of CPU/RAM, routing tables, firewall rules, and logs. The first step for troubleshooting.]', 
            local: true 
        },
        fast: { 
            cmd: 'sh speed_wizard.sh', 
            summary: 'SQM Auto-Tuner',
            desc: '[Runs a speed test and configures CAKE Smart Queue Management. Eliminates bufferbloat and lag for gaming and video calls.]', 
            local: true 
        },
        true: { 
            cmd: 'sh validate.sh', 
            summary: 'Installation Validator',
            desc: '[Verifies that the current install matches the official release manifest and that all security services are active and healthy.]', 
            local: true 
        },
        
        // 🗑️ MAINTENANCE
        away: { 
            cmd: 'curl -sL ci5.run | sh -s away', 
            summary: 'Factory Reset (CI5)',
            desc: '[Completely removes all CI5 scripts, containers, and configurations. Restores the router to a clean, stock OpenWrt state.]' 
        },
        pure: { 
            cmd: 'curl -sL ci5.run | sh -s pure', 
            summary: 'Selective Uninstaller',
            desc: '[Interactive wizard to remove specific components. Tracks install state for clean removal. Respects dependencies between corks.]' 
        },
        wipe: { 
            cmd: 'curl -sL ci5.run | sh -s wipe', 
            summary: 'Digital Shredder',
            desc: '[Securely overwrites VPN keys, wipes shell history, flushes logs, and trims storage. Use before crossing borders or selling device.]' 
        },
        
        // 🔐 VPN & PRIVACY
        mullvad: { 
            cmd: 'curl -sL ci5.run | sh -s mullvad', 
            summary: 'WireGuard Privacy Shield',
            desc: '[Configure Mullvad VPN with an automatic Killswitch. If the VPN drops, all traffic is blocked to prevent IP leaks.]' 
        },
        tailscale: { 
            cmd: 'curl -sL ci5.run | sh -s tailscale', 
            summary: 'Mesh Network Node',
            desc: '[Connects your router to Tailscale for secure remote access. Reach your home devices from anywhere without opening firewall ports.]' 
        },
        hybrid: { 
            cmd: 'curl -sL ci5.run | sh -s hybrid', 
            summary: 'Split-Horizon Routing',
            desc: '[Directs incoming remote access through Tailscale, while forcing all outgoing home traffic through the anonymous Mullvad VPN.]' 
        },
        
        // ✈️ TRAVEL
        travel: { 
            cmd: 'curl -sL ci5.run | sh -s travel', 
            summary: 'Hotel Wi-Fi Bypass',
            desc: '[Clones your MAC address and modifies TTL to mimic a single device. Essential for getting past captive portals at hotels & airports.]' 
        },
        clone: { 
            cmd: 'curl -sL ci5.run | sh -s clone', 
            summary: 'SD Card Backup',
            desc: '[Complete system clone to SD/USB with compression, encryption, and phone-flashable images. Deniable layouts for travel security.]' 
        },
        focus: { 
            cmd: 'curl -sL ci5.run | sh -s focus', 
            summary: 'Productivity Timer',
            desc: '[Temporarily blocks distracting sites (Social, Streaming) for a set duration. Automatically unblocks them when the timer expires.]' 
        },
        
        // 📡 MONITORING
        alert: { 
            cmd: 'curl -sL ci5.run | sh -s alert', 
            summary: 'Mobile Notifications',
            desc: '[Configures ntfy.sh to send push alerts to your phone. Get notified instantly of intrusion attempts, errors, or reboots.]' 
        },
        ddns: { 
            cmd: 'curl -sL ci5.run | sh -s ddns', 
            summary: 'Dynamic IP Sync',
            desc: '[Updates DNS records and re-syncs WireGuard peers when your home IP changes. Keeps VPNs connected on dynamic residential lines.]' 
        },
        gsense: { 
            cmd: 'curl -sL ci5.run | sh -s gsense', 
            summary: 'Low-Latency VPN',
            desc: '[Gaming-optimized VPN with real-time latency monitoring. Auto-switches endpoints for lowest ping.]' 
        }
    };

    // Glitch Animation
    const g = document.getElementById('glitch');
    if (g) {
        const loop = () => {
            setTimeout(() => {
                g.textContent = '7';
                setTimeout(() => { g.textContent = '0'; loop(); }, 80);
            }, Math.random() * 8000 + 2000);
        };
        loop();
    }

    // Flash Terminal Helper
    let flashTimeout; 
    const flashTerminal = (color) => {
        if (flashTimeout) clearTimeout(flashTimeout);
        terminal.classList.remove('flash-green', 'flash-cyan', 'flash-purple', 'flash-orange', 'flash-yellow', 'flash-white', 'flash-dim', 'flash-red');
        void terminal.offsetWidth; 
        terminal.classList.add(`flash-${color}`);
        flashTimeout = setTimeout(() => {
            terminal.classList.remove(`flash-${color}`);
        }, 1470);
    };

    // Core Command Logic
    const runCommand = (key) => {
        const c = COMMANDS[key];
        if (!c) return false;

        const color = CAT_COLORS[key] || 'green';
        flashTerminal(color);

        const t = c.local ? '<span style="color:var(--yellow)">[LOCAL]</span> ' : '';
        
        output.innerHTML = `
<span style="color:var(--${color})">${key.toUpperCase()}:</span> <span style="color:var(--white)">${c.summary}</span>
${t}${c.desc}

<span style="color:var(--green)">${c.cmd}</span>`;
        return true;
    };

    // Terminal Input Listener
    input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const v = input.value.trim().toLowerCase();
        input.value = '';
        if (!v) return;
        
        if (v === 'clear' || v === 'cls') { output.innerHTML = ''; return; }
        if (v === 'help' || v === '?' || v === 'ls') {
            output.innerHTML = `<span style="color:var(--cyan)">${Object.keys(COMMANDS).join(' ')}</span>`;
            return;
        }
        
        // Try direct lookup
        let key = v;
        
        // If no direct match, try finding by command string
        if (!COMMANDS[key]) {
            const foundEntry = Object.entries(COMMANDS).find(([k, val]) => val.cmd.toLowerCase() === v);
            if (foundEntry) key = foundEntry[0];
        }
        
        if (!runCommand(key)) {
            flashTerminal('red');
            output.innerHTML = `<span style="color:var(--red)">Unknown:</span> ${v}`;
        }
    });

    // Toast Notification
    let tt;
    const showToast = (txt, colorName = 'green') => {
        toast.textContent = txt;
        toast.style.backgroundColor = `var(--${colorName})`;
        toast.style.color = '#000';
        toast.classList.add('show');
        clearTimeout(tt);
        tt = setTimeout(() => toast.classList.remove('show'), 1200);
    };

    // Click Interactions
    document.querySelectorAll('.entry').forEach(el => {
        el.addEventListener('click', () => {
            const code = el.querySelector('code');
            const key = el.getAttribute('data-cmd');
            
            if (!code) return;

            if (key) runCommand(key);

            navigator.clipboard.writeText(code.textContent).then(() => {
                triggerCopyVisuals(el, key, 'Copied!');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = code.textContent;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                triggerCopyVisuals(el, key, 'Copied!');
            });
        });
    });

    const triggerCopyVisuals = (el, key, msg) => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 250);
        const color = CAT_COLORS[key] || 'green';
        showToast(msg, color);
    };

    // Auto-focus Input
    document.addEventListener('keydown', e => {
        if (document.activeElement !== input && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            input.focus();
        }
    });
});
