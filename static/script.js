/**
 * CI5.RUN - Compact Directory
 * v8.4-RELEASE
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
        free: { cmd: 'curl ci5.run/free | sh', desc: 'Full Stack: Docker + Suricata IDS + Corks' },
        '4evr': { cmd: 'curl ci5.run/4evr | sh', desc: 'Sovereign: Minimal, no Docker, no telemetry' },
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

    // Glitch
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
    const flashTerminal = (color) => {
        // Remove any existing flash classes to allow re-trigger
        terminal.classList.remove('flash-green', 'flash-cyan', 'flash-purple', 'flash-orange', 'flash-yellow', 'flash-white', 'flash-dim', 'flash-red');
        
        // Force reflow to restart animation if same color is typed twice quickly
        void terminal.offsetWidth; 
        
        terminal.classList.add(`flash-${color}`);
        
        // Cleanup class after animation ends (1000ms = 1s)
        setTimeout(() => {
            terminal.classList.remove(`flash-${color}`);
        }, 1000);
    };

    // Terminal
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
        
        // 1. Try direct lookup (e.g., "heal")
        let key = v;
        let c = COMMANDS[v];

        // 2. If no match, try finding by command string (e.g., "curl ci5.run/heal | sh")
        if (!c) {
            const foundEntry = Object.entries(COMMANDS).find(([k, val]) => val.cmd.toLowerCase() === v);
            if (foundEntry) {
                key = foundEntry[0]; 
                c = foundEntry[1];
            }
        }
        
        if (c) {
            // Trigger Flash
            const color = CAT_COLORS[key] || 'green';
            flashTerminal(color);

            const t = c.local ? '<span style="color:var(--yellow)">[LOCAL]</span> ' : '';
            output.innerHTML = `<span style="color:var(--cyan)">${key.toUpperCase()}</span> ${t}${c.desc}\n<span style="color:var(--green)">${c.cmd}</span>`;
            return;
        }
        
        // Error Flash
        flashTerminal('red');
        output.innerHTML = `<span style="color:var(--red)">Unknown:</span> ${v}`;
    });

    // Click to copy
    let tt;
    const show = txt => {
        toast.textContent = txt;
        toast.classList.add('show');
        clearTimeout(tt);
        tt = setTimeout(() => toast.classList.remove('show'), 1200);
    };

    document.querySelectorAll('.entry').forEach(el => {
        el.addEventListener('click', () => {
            const code = el.querySelector('code');
            if (!code) return;
            navigator.clipboard.writeText(code.textContent).then(() => {
                el.classList.add('copied');
                setTimeout(() => el.classList.remove('copied'), 250);
                show('Copied!');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = code.textContent;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                el.classList.add('copied');
                setTimeout(() => el.classList.remove('copied'), 250);
                show('Copied!');
            });
        });
    });

    // Auto-focus
    document.addEventListener('keydown', e => {
        if (document.activeElement !== input && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            input.focus();
        }
    });
});