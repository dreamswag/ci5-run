document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('terminalOutput');
    const input = document.getElementById('domainInput');

    const boot = [
        "UPLINK ESTABLISHED.",
        "IDENTITY: [CAN'T TELEMETRY]",
        "STATUS: SOVEREIGN",
        "\nCOMMAND PROTOCOLS",
        "--------------------",
        "  > FREE       curl ci5.run/free    | sh",
        "  > FAST       curl ci5.run/fast    | sh",
        "  > FAR        curl ci5.run/far     | sh",
        "  > AWAY       curl ci5.run/away    | sh",
        "  > TRUE       curl ci5.run/true    | sh",
        "  > FOREVER    curl ci5.run/forever | sh",
        "  > HIDE       curl ci5.run/hide    | sh",
        "  > OFF        curl ci5.run/off     | sh",
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

            // STRICT PROTOCOL
            if (['install', 'setup', 'bootstrap'].includes(val)) {
                out.textContent += `Err: PARADIGM OBSOLETE. USE 'FREE'\n`;
            } 
            else if (['speed', 'optimize'].includes(val)) {
                out.textContent += `Err: USE 'FAST'\n`;
            }
            else if (['debug', 'deep', 'audit'].includes(val)) {
                out.textContent += `Err: USE 'FAR'\n`;
            }
            else if (['uninstall', 'remove'].includes(val)) {
                out.textContent += `Err: USE 'AWAY' (Partial) OR 'OFF' (Total)\n`;
            }
            else if (['recover', 'restore', 'fix'].includes(val)) {
                out.textContent += `Err: USE 'FOREVER'\n`;
            }
            else if (['check', 'verify'].includes(val)) {
                out.textContent += `Err: USE 'TRUE'\n`;
            }

            // THE 8 PILLARS
            else if (val === 'free') {
                out.textContent += `\nINITIALIZE / LIBERATE:\ncurl ci5.run/free | sh\n\n`;
            } else if (val === 'fast') {
                out.textContent += `\nOPTIMIZE / ACCELERATE:\ncurl ci5.run/fast | sh\n\n`;
            } else if (val === 'far') {
                out.textContent += `\nANALYZE / AUDIT:\ncurl ci5.run/far | sh\n\n`;
            } else if (val === 'away') {
                out.textContent += `\nPARTIAL UNINSTALL (Keep Router):\ncurl ci5.run/away | sh\n\n`;
            } else if (val === 'true') {
                out.textContent += `\nVERIFY / ALIGN:\ncurl ci5.run/true | sh\n\n`;
            } else if (val === 'forever') {
                out.textContent += `\nRESTORE / PERSIST:\ncurl ci5.run/forever | sh\n\n`;
            } else if (val === 'hide') {
                out.textContent += `\nSTEALTH / CLOAK (Kill WAN if Inspection Dies):\ncurl ci5.run/hide | sh\n\n`;
            } else if (val === 'off') {
                out.textContent += `\nKILL / TOTAL WIPE:\ncurl ci5.run/off | sh\n\n`;
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