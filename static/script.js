document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('terminalOutput');
    const input = document.getElementById('domainInput');

    const boot = [
        "UPLINK ESTABLISHED.",
        "IDENTITY: [TELEMETRY_ERR:410]",
        "STATUS: SOVEREIGN",
        "\nCOMMAND PROTOCOLS",
        "--------------------",
        "  > FREE       curl ci5.run/free    | sh",
        "  > FAST       curl ci5.run/fast    | sh",
        "  > HEAL       curl ci5.run/heal    | sh",
        "  > SELF       curl ci5.run/self    | sh",
        "  > PURE       curl ci5.run/pure    | sh",
        "  > TRUE       curl ci5.run/true    | sh",
        "  > HOME       curl ci5.run/home    | sh",
        "  > HIDE       curl ci5.run/hide    | sh",
        "  > AWAY       curl ci5.run/away    | sh",
        "\n"
    ];

    async function init() {
        for (let line of boot) {
            out.textContent += line + "\n";
            await new Promise(r => setTimeout(r, 60));
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            input.value = '';
            out.textContent += `root@ci5:~$ ${val}\n`;

            // STRICT PROTOCOL (Rejections)
            if (['install', 'bootstrap'].includes(val)) {
                out.textContent += `Err: PARADIGM OBSOLETE. USE 'FREE'\n`;
            } 
            else if (['speed', 'optimize'].includes(val)) {
                out.textContent += `Err: USE 'FAST'\n`;
            }
            else if (['debug', 'deep', 'far'].includes(val)) {
                out.textContent += `Err: USE 'SELF'\n`;
            }
            else if (['check', 'verify'].includes(val)) {
                out.textContent += `Err: USE 'TRUE'\n`;
            }
            else if (['clean', 'core', 'partial'].includes(val)) {
                out.textContent += `Err: USE 'PURE'\n`;
            }
            else if (['restore', 'fix', 'recover', 'forever'].includes(val)) {
                out.textContent += `Err: USE 'HEAL'\n`;
            }
            else if (['vpn', 'remote', 'tailscale'].includes(val)) {
                out.textContent += `Err: USE 'HOME'\n`;
            }
            else if (['uninstall', 'nuke', 'off', 'flee'].includes(val)) {
                out.textContent += `Err: USE 'AWAY'\n`;
            }

            // THE 9 PILLARS
            else if (val === 'free') {
                out.textContent += `\nINITIALIZE / LIBERATE:\ncurl ci5.run/free | sh\n\n`;
            } else if (val === 'fast') {
                out.textContent += `\nOPTIMIZE / ACCELERATE:\ncurl ci5.run/fast | sh\n\n`;
            } else if (val === 'heal') {
                out.textContent += `\nRESTORE / PERSIST:\ncurl ci5.run/heal | sh\n\n`;
            } else if (val === 'self') {
                out.textContent += `\nDIAGNOSE / INTROSPECT:\ncurl ci5.run/self | sh\n\n`;
            } else if (val === 'pure') {
                out.textContent += `\nCLEANSE / STRIP (Core Only):\ncurl ci5.run/pure | sh\n\n`;
            } else if (val === 'true') {
                out.textContent += `\nVERIFY / ALIGN:\ncurl ci5.run/true | sh\n\n`;
            } else if (val === 'home') {
                out.textContent += `\nREMOTE / CONNECT (Tailscale):\ncurl ci5.run/home | sh\n\n`;
            } else if (val === 'hide') {
                out.textContent += `\nSTEALTH / CLOAK (Kill WAN if Inspection Dies):\ncurl ci5.run/hide | sh\n\n`;
            } else if (val === 'away') {
                out.textContent += `\nTOTAL UNINSTALL / NUKE:\ncurl ci5.run/away | sh\n\n`;
            }
            
            else if (val === 'clear') {
                out.textContent = '';
            } else if (val !== '') {
                out.textContent += `Err: Unknown command\n`;
            }
            out.scrollTop = out.scrollHeight;
        }
    });

    document.addEventListener('click', () => input.focus());
    init();
});