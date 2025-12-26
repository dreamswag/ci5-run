/**
 * CI5.RUN - Compact Directory
 * v8.8-RELEASE (Structured Terminal Output)
 */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const toast = document.getElementById('toast');
    const terminal = document.querySelector('.terminal');

    // Define colors for categories
    const CAT_COLORS = {
        free: 'green', '4evr': 'green',
        heal: 'cyan', rescue: 'cyan', status: 'cyan',
        mullvad: 'purple', tailscale: 'purple', hybrid: 'purple',
        travel: 'orange', focus: 'orange', wipe: 'orange',
        alert: 'yellow', ddns: 'yellow',
        paranoia: 'white', backup: 'white', update: 'white',
        self: 'dim', fast: 'dim', true: 'dim',
        away: 'red', pure: 'red'
    };

    const COMMANDS = {
        free: { 
            cmd: 'curl ci5.run/free | sh', 
            summary: '[Full Stack]',
            desc: '[Installs Docker, Suricata IDS, AdGuard Home, and CrowdSec. Maximum security & monitoring.]' 
        },
        '4evr': { 
            cmd: 'curl ci5.run/4evr | sh', 
            summary: '[Sovereign Stack]',
            desc: '[No Docker. Includes kernel hardening, Unbound DNS, and CAKE SQM. Pure efficiency.]' 
        },
        heal: { 
            cmd: 'curl ci5.run/heal | sh', 
            summary: 'System Integrity Repair',
            desc: '[Verifies local scripts against trusted server checksums. Automatically restores missing or corrupted files to fix broken systems.]' 
        },
        rescue: { 
            cmd: 'curl ci5.run/rescue | sh', 
            summary: 'Emergency DNS Bypass',
            desc: '[Forces the router to use public resolvers (1.1.1.1) to restore internet access when local DNS fails but connection is active.]' 
        },
        status: { 
            cmd: 'curl ci5.run/status | sh', 
            summary: 'Quick Health Check',
            desc: '[Runs a simplified pass/fail diagnostic on internet connectivity, firewall rules, and services. Useful for a quick status verification.]' 
        },
        mullvad: { 
            cmd: 'curl ci5.run/mullvad | sh', 
            summary: 'WireGuard Privacy Shield',
            desc: '[Configure Mullvad VPN with an automatic Killswitch. If the VPN drops, all traffic is blocked to prevent IP leaks.]' 
        },
        tailscale: { 
            cmd: 'curl ci5.run/tailscale | sh', 
            summary: 'Mesh Network Node',
            desc: '[Connects your router to Tailscale for secure remote access. Reach your home devices from anywhere without opening firewall ports.]' 
        },
        hybrid: { 
            cmd: 'curl ci5.run/hybrid | sh', 
            summary: 'Split-Horizon Routing',
            desc: '[Directs incoming remote access through Tailscale, while forcing all outgoing home traffic through the anonymous Mullvad VPN.]' 
        },
        travel: { 
            cmd: 'curl ci5.run/travel | sh', 
            summary: 'Hotel Wi-Fi Bypass',
            desc: '[Clones your MAC address and modifies TTL to mimic a single device. Essential for getting past captive portals at hotels & airports.]' 
        },
        focus: { 
            cmd: 'curl ci5.run/focus | sh', 
            summary: 'Productivity Timer',
            desc: '[Temporarily blocks distracting sites (Social, Streaming) for a set duration. Automatically unblocks them when the timer expires.]' 
        },
        wipe: { 
            cmd: 'curl ci5.run/wipe | sh', 
            summary: 'Digital Shredder',
            desc: '[Securely overwrites VPN keys, wipes shell history, flushes logs, and trims storage. Use before crossing borders or selling device.]' 
        },
        alert: { 
            cmd: 'curl ci5.run/alert | sh', 
            summary: 'Mobile Notifications',
            desc: '[Configures ntfy.sh to send push alerts to your phone. Get notified instantly of intrusion attempts, errors, or reboots.]' 
        },
        ddns: { 
            cmd: 'curl ci5.run/ddns | sh', 
            summary: 'Dynamic IP Sync',
            desc: '[Updates DNS records and re-syncs WireGuard peers when your home IP changes. Keeps VPNs connected on dynamic residential lines.]' 
        },
        paranoia: { 
            cmd: 'curl ci5.run/paranoia | sh', 
            summary: '[FREE Only] IDS Dead-Man Switch',
            desc: '[Monitors Suricata Intrusion Detection. If the scanner dies, it kills the internet connection to ensure no un-scanned traffic.]' 
        },
        backup: { 
            cmd: 'curl ci5.run/backup | sh', 
            summary: 'Hardware-Locked Export',
            desc: '[Creates an encrypted config backup bound to this specific device\'s hardware ID. Cannot be decrypted on any other router.]' 
        },
        update: { 
            cmd: 'curl ci5.run/update | sh', 
            summary: 'Secure Self-Update',
            desc: '[Fetches latest scripts with GPG signature verification. Includes a rollback checkpoint to revert changes if the update fails.]' 
        },
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
        away: { 
            cmd: 'curl ci5.run/away | sh', 
            summary: 'Factory Reset (CI5)',
            desc: '[Completely removes all CI5 scripts, containers, and configurations. Restores the router to a clean, stock OpenWrt state.]' 
        },
        pure: { 
            cmd: 'curl ci5.run/pure | sh', 
            summary: 'Selective Uninstaller',
            desc: '[Interactive wizard to remove specific components (e.g., "remove just Docker" or "remove just WireGuard") while keeping others.]' 
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

    // Flash Terminal Helper (Fixed for Fast Clicking)
    let flashTimeout; 
    const flashTerminal = (color) => {
        // Clear any existing cleanup timer to prevent premature removal
        if (flashTimeout) clearTimeout(flashTimeout);

        // Remove any existing flash classes
        terminal.classList.remove('flash-green', 'flash-cyan', 'flash-purple', 'flash-orange', 'flash-yellow', 'flash-white', 'flash-dim', 'flash-red');
        
        // Force reflow to restart animation
        void terminal.offsetWidth; 
        
        // Add new flash class
        terminal.classList.add(`flash-${color}`);
        
        // Cleanup class after animation ends (1.47s = 1470ms)
        flashTimeout = setTimeout(() => {
            terminal.classList.remove(`flash-${color}`);
        }, 1470);
    };

    // Core Command Logic (Shared by Click and Type)
    const runCommand = (key) => {
        const c = COMMANDS[key];
        if (!c) return false;

        // Get Color
        const color = CAT_COLORS[key] || 'green';
        
        // Trigger Flash
        flashTerminal(color);

        // Render Output (Structured format: Name: [Summary] \n Desc \n \n Command)
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
        
        // 1. Try direct lookup
        let key = v;
        
        // 2. If no direct match, try finding by command string
        if (!COMMANDS[key]) {
            const foundEntry = Object.entries(COMMANDS).find(([k, val]) => val.cmd.toLowerCase() === v);
            if (foundEntry) key = foundEntry[0];
        }
        
        // Execute
        if (!runCommand(key)) {
            flashTerminal('red');
            output.innerHTML = `<span style="color:var(--red)">Unknown:</span> ${v}`;
        }
    });

    // Toast Notification
    let tt;
    const showToast = (txt, colorName = 'green') => {
        toast.textContent = txt;
        
        // Apply category color to toast
        toast.style.backgroundColor = `var(--${colorName})`;
        toast.style.color = '#000'; // Ensure readability

        toast.classList.add('show');
        clearTimeout(tt);
        tt = setTimeout(() => toast.classList.remove('show'), 1200);
    };

    // Click Interactions
    document.querySelectorAll('.entry').forEach(el => {
        el.addEventListener('click', () => {
            const code = el.querySelector('code');
            const key = el.getAttribute('data-cmd'); // Get command key
            
            if (!code) return;

            // Execute Terminal Logic
            if (key) runCommand(key);

            // Copy to Clipboard
            navigator.clipboard.writeText(code.textContent).then(() => {
                triggerCopyVisuals(el, key, 'Copied!');
            }).catch(() => {
                // Fallback for older browsers / non-secure contexts
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
        
        // Get color for toast
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