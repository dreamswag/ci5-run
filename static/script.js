document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('terminalOutput');
    const input = document.getElementById('domainInput');

    const boot = [
        "<span class='green'>UPLINK ESTABLISHED.</span>",
        "IDENTITY: [<span class='red'>TELEMETRY_ERR:41</span><span id='glitch'>0</span>]",
        "STATUS: <span class='purple'>SOVEREIGN</span>",
        "\n<span class='dim'>COMMAND PROTOCOLS</span>",
        "<span class='dim'>--------------------</span>",
        "  > <span class='cyan'>FREE</span>       curl ci5.run/free    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>FAST</span>       curl ci5.run/fast    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>HEAL</span>       curl ci5.run/heal    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>SELF</span>       curl ci5.run/self    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>PURE</span>       curl ci5.run/pure    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>TRUE</span>       curl ci5.run/true    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>HOME</span>       curl ci5.run/home    <span class='dim'>| sh</span>",
        "  > <span class='cyan'>HIDE</span>       curl ci5.run/hide    <span class='dim'>| sh</span>",
        "  > <span class='red'>AWAY</span>       curl ci5.run/away    <span class='dim'>| sh</span>",
        "\n"
    ];

    function startGlitch() {
        const el = document.getElementById('glitch');
        if (!el) return;

        const glitchLoop = () => {
            const timeout = Math.random() * 9000 + 3000;
            
            setTimeout(() => {
                el.textContent = '7';
                el.style.opacity = '0.8';
                
                setTimeout(() => {
                    el.textContent = '0';
                    el.style.opacity = '1';
                    glitchLoop(); 
                }, 80);
            }, timeout);
        };
        glitchLoop();
    }

    async function init() {
        for (let line of boot) {
            out.innerHTML += line + "\n";
            out.scrollTop = out.scrollHeight;
            await new Promise(r => setTimeout(r, 40));
        }
        startGlitch();
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            input.value = '';
            
            out.innerHTML += `<span class='green'>root@ci5:~$</span> <span class='white'>${val}</span>\n`;

            if (['install', 'bootstrap'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: PARADIGM OBSOLETE. USE 'FREE'</span>\n`;
            } 
            else if (['speed', 'optimize'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'FAST'</span>\n`;
            }
            else if (['debug', 'deep', 'far'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'SELF'</span>\n`;
            }
            else if (['check', 'verify'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'TRUE'</span>\n`;
            }
            else if (['clean', 'core', 'partial'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'PURE'</span>\n`;
            }
            else if (['restore', 'fix', 'recover', 'forever'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'HEAL'</span>\n`;
            }
            else if (['vpn', 'remote', 'tailscale'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'HOME'</span>\n`;
            }
            else if (['uninstall', 'nuke', 'off', 'flee'].includes(val)) {
                out.innerHTML += `<span class='red'>Err: USE 'AWAY'</span>\n`;
            }

            else if (val === 'free') {
                out.innerHTML += `\n<span class='cyan'>INITIALIZE / LIBERATE:</span>\ncurl ci5.run/free | sh\n\n`;
            } else if (val === 'fast') {
                out.innerHTML += `\n<span class='cyan'>OPTIMIZE / ACCELERATE:</span>\ncurl ci5.run/fast | sh\n\n`;
            } else if (val === 'heal') {
                out.innerHTML += `\n<span class='purple'>RESTORE / PERSIST:</span>\ncurl ci5.run/heal | sh\n\n`;
            } else if (val === 'self') {
                out.innerHTML += `\n<span class='purple'>DIAGNOSE / INTROSPECT:</span>\ncurl ci5.run/self | sh\n\n`;
            } else if (val === 'pure') {
                out.innerHTML += `\n<span class='cyan'>CLEANSE / STRIP (Core Only):</span>\ncurl ci5.run/pure | sh\n\n`;
            } else if (val === 'true') {
                out.innerHTML += `\n<span class='purple'>VERIFY / ALIGN:</span>\ncurl ci5.run/true | sh\n\n`;
            } else if (val === 'home') {
                out.innerHTML += `\n<span class='cyan'>REMOTE / CONNECT (Tailscale):</span>\ncurl ci5.run/home | sh\n\n`;
            } else if (val === 'hide') {
                out.innerHTML += `\n<span class='red'>STEALTH / CLOAK (Kill WAN if Inspection Dies):</span>\ncurl ci5.run/hide | sh\n\n`;
            } else if (val === 'away') {
                out.innerHTML += `\n<span class='red'>TOTAL UNINSTALL / NUKE:</span>\ncurl ci5.run/away | sh\n\n`;
            }
            
            else if (val === 'clear') {
                out.textContent = ''; 
            } else if (val !== '') {
                out.innerHTML += `<span class='dim'>Err: Unknown command</span>\n`;
            }
            out.scrollTop = out.scrollHeight;
        }
    });

    document.addEventListener('click', () => input.focus());
    init();
});