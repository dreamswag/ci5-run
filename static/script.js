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
        free: { cmd: 'curl ci5.run/free | sh', desc: '[Full Stack] Lite Features + Docker (Suricata + CrowdSec + AdGuard Home + Ntopng & Redis + Homepage) + Corks' },
        '4evr': { cmd: 'curl ci5.run/4evr | sh', desc: '[Lite Stack] No Docker + Kernel Performance Tweaks + Local Firewall Zones + Unbound DNS + CAKE SQM' },
        heal: { cmd: 'curl ci5.run/heal | sh', desc: 'Verify + restore base scripts from ci5.host' },
        rescue: { cmd: 'curl ci5.run/rescue | sh', desc: 'Force public DNS (1.1.1.1, 9.9.9.9)' },
        status: { cmd: 'curl ci5.run/status | sh', desc: 'Quick health check, exit 0 = healthy' },
        mullvad: { cmd: 'curl ci5.run/mullvad | sh', desc: 'Mullvad WireGuard + killswitch' },
        tailscale: { cmd: 'curl ci5.run/tailscale | sh', desc: 'Tailscale mesh network' },
        hybrid: { cmd: 'curl ci5.run/hybrid | sh', desc: 'Tailscale ingress → Mullvad egress' },
        travel: { cmd: 'curl ci5.run/travel | sh', desc: 'MAC clone + TTL fix + captive portal' },
        focus: { cmd: 'curl ci5.run/focus | sh', desc: 'Temporary domain blocking with timer' },
        wipe: { cmd: 'curl ci5.run/wipe | sh', desc: 'Shred keys, flush logs, fstrim' },
        alert: { cmd: 'curl ci5.run/alert | sh', desc: 'ntfy.sh push notifications' },
        ddns: { cmd: 'curl ci5.run/ddns | sh', desc: 'Dynamic DNS + WireGuard IP sync' },
        paranoia: { cmd: 'curl ci5.run/paranoia | sh', desc: 'Kill WAN if Suricata dies (FREE only)' },
        backup: { cmd: 'curl ci5.run/backup | sh', desc: 'Encrypted config export' },
        update: { cmd: 'curl ci5.run/update | sh', desc: 'GPG-verified self-update' },
        self: { cmd: 'sh bone_marrow.sh', desc: 'Full diagnostic dump', local: true },
        fast: { cmd: 'sh speed_wizard.sh', desc: 'SQM/CAKE auto-tune', local: true },
        true: { cmd: 'sh validate.sh', desc: 'Post-install validation', local: true },
        away: { cmd: 'curl ci5.run/away | sh', desc: 'Full uninstall' },
        pure: { cmd: 'curl ci5.run/pure | sh', desc: 'Selective component removal' }
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

        // Render Output (Structured format: Name: \n Desc \n \n Command)
        const t = c.local ? '<span style="color:var(--yellow)">[LOCAL]</span> ' : '';
        
        output.innerHTML = `
<span style="color:var(--${color})">${key.toUpperCase()}:</span>
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