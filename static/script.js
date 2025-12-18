const out = document.getElementById('out');
const input = document.getElementById('cmd');

const boot = [
    "UPLINK ESTABLISHED.",
    "IDENTITY: [CAN'T TELEMETRY]",
    "PROCEED...",
    "\nDEPLOYMENT COMMANDS\n-------------------\n  > INSTALL    curl ci5.run/install | sh\n  > RECOVER    curl ci5.run/recover | sh\n  > SPEED      curl ci5.run/speed | sh\n"
];

async function init() {
    for (let line of boot) {
        out.textContent += line + "\n";
        await new Promise(r => setTimeout(r, 150));
    }
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = input.value.trim().toLowerCase();
        input.value = '';
        out.textContent += `root@ci5:~$ ${val}\n`;

        if (['install', 'recover', 'speed'].includes(val)) {
            out.textContent += `\nRUN ON TARGET:\ncurl ci5.run/${val} | sh\n\n`;
        } else if (val === 'clear') {
            out.textContent = '';
        } else {
            out.textContent += `Err: Unknown command\n`;
        }
        out.scrollTop = out.scrollHeight;
    }
});

document.addEventListener('click', () => input.focus());
init();