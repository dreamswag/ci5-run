document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('terminalOutput');
    const input = document.getElementById('domainInput');
    const termWindow = document.getElementById('terminalWindow');
    
    // Controls
    const minBtn = document.getElementById('minBtn');
    const maxBtn = document.getElementById('maxBtn');
    const closeBtn = document.getElementById('closeBtn');
    const taskbar = document.getElementById('taskbar');
    const restoreBtn = document.getElementById('restoreBtn');

    function isSovereignMode() { return window.location.hostname.includes('ipfs') || window.location.hostname.includes('localhost'); }

    // Focus Trap
    document.addEventListener('click', (e) => {
        if (window.getSelection().type !== 'Range') input.focus();
    });

    // --- LIVE DATA ---
    let globalCount = 0; 
    async function fetchStats() {
        try { if (!isSovereignMode()) { const r = await fetch('/api/stats'); const d = await r.json(); globalCount = d.count || globalCount; } } catch(e){}
    }
    setInterval(fetchStats, 15000);

    async function getCommit() {
        try { const r = await fetch('https://api.github.com/repos/dreamswag/ci5/commits/main'); const d = await r.json(); return d.sha.substring(0,7); } catch(e){ return "OFFLINE"; }
    }

    // --- TERMINAL BOOT ---
    async function boot() {
        fetchStats();
        const hash = await getCommit();
        const release = "https://github.com/dreamswag/ci5/releases/latest/download";
        const c_free = isSovereignMode() ? `curl -L ${release}/install-full.sh | sh` : "curl ci5.run/free | sh";

        const lines = [
            "<span class='green'>UPLINK ESTABLISHED.</span>",
            `IDENTITY: [<span class='red'>TELEMETRY_ERR:41</span><span id='glitch'>0</span>]`,
            `CORK INTEGRITY: [<span class='purple'>${hash}</span>]`, 
            `OASIS CHECKPOINT: <span class='purple'>${globalCount.toLocaleString()}</span> SOVEREIGNS`,
            "<span class='ghost'>...send word if you make it</span>", 
            "\n<span class='dim'>COMMAND PROTOCOLS</span>",
            "<span class='dim'>--------------------</span>",
            `  > <span class='green'>FREE</span>       ${c_free}`, 
            `  > <span class='cyan'>CORK</span>       (Registry Search)`,
            `  > <span class='green'>WARD</span>       curl ci5.run/ward | sh`, 
            `  > <span class='purple'>SAFE</span>       curl ci5.run/safe | sh`, 
            `  > <span class='red'>VOID</span>       curl ci5.run/void | sh`, 
            "\n"
        ];

        for (let line of lines) {
            out.innerHTML += line + "\n";
            out.scrollTop = out.scrollHeight;
            await new Promise(r => setTimeout(r, 30));
        }
        // Glitch Effect
        setInterval(() => {
            const el = document.getElementById('glitch');
            if(el) { el.textContent = '7'; setTimeout(() => el.textContent = '0', 100); }
        }, 5000);
    }

    // --- INPUT HANDLER ---
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            input.value = '';
            out.innerHTML += `<span class='green'>root@ci5:~$</span> <span class='white'>${val}</span>\n`;

            // CORK SEARCH LOGIC (Remote Fetch)
            if (val.startsWith('cork')) {
                const parts = val.split(' ');
                const query = parts[2];
                if (parts[1] === 'search') {
                    out.innerHTML += `<span class='dim'>CONNECTING TO [ci5.dev]...</span>\n`;
                    try {
                        const r = await fetch('https://ci5.dev/corks.json');
                        const db = await r.json();
                        let found = false;
                        
                        const print = (label, cls, items) => {
                            for (const [k, v] of Object.entries(items)) {
                                if (!query || k.includes(query)) {
                                    out.innerHTML += `[<span class='${cls}'>${label}</span>] <span class='white'>${k}</span>\n    <span class='dim'>${v.desc}</span>\n`;
                                    found = true;
                                }
                            }
                        };
                        if (db.official) print('OFFICIAL', 'green', db.official);
                        if (db.community) print('COMMUNITY', 'orange', db.community);
                        
                        if (!found) out.innerHTML += `<span class='red'>No matches for '${query}'</span>\n`;
                    } catch(err) { out.innerHTML += `<span class='red'>REGISTRY UNREACHABLE.</span>\n`; }
                    out.innerHTML += `\n`;
                } else if (parts[1] === 'install' && query) {
                    out.innerHTML += `<span class='green'>QUEUED:</span> ${query}\n<span class='dim'>Add to Soul config to apply.</span>\n\n`;
                } else {
                    out.innerHTML += `USAGE: cork search &lt;term&gt; | cork install &lt;name&gt;\n\n`;
                }

            // STANDARD COMMANDS
            } else if (val === 'free') {
                out.innerHTML += `<span class='cyan'>INSTALL:</span> Wipes disk. Flashes Golden Image.\n<span class='dim'>RUN:</span> curl ci5.run/free | sh\n\n`;
            } else if (['ward','safe','void','rrul','fast'].includes(val)) {
                out.innerHTML += `<span class='dim'>RUN:</span> curl ci5.run/${val} | sh\n\n`;
            } else if (val === 'clear') {
                out.textContent = '';
            } else if (val !== '') {
                out.innerHTML += `<span class='dim'>Err: Unknown command. Type 'free' or 'cork'.</span>\n`;
            }
            out.scrollTop = out.scrollHeight;
        }
    });

    // Window Drag Logic (Simplified for stability)
    let isDrag = false, startX, startY, winX, winY;
    const win = document.getElementById('terminalWindow');
    const head = document.getElementById('headerHandle');

    head.addEventListener('mousedown', (e) => {
        if(e.target.closest('.controls')) return;
        isDrag = true; 
        startX = e.clientX; startY = e.clientY;
        const rect = win.getBoundingClientRect();
        winX = rect.left; winY = rect.top;
        win.style.transform = 'none'; // Disable centering transform
        win.style.left = winX + 'px'; win.style.top = winY + 'px';
    });
    document.addEventListener('mousemove', (e) => {
        if(!isDrag) return;
        win.style.left = (winX + (e.clientX - startX)) + 'px';
        win.style.top = (winY + (e.clientY - startY)) + 'px';
    });
    document.addEventListener('mouseup', () => isDrag = false);

    // Controls
    closeBtn.addEventListener('click', () => { 
        win.style.opacity = '0'; 
        setTimeout(() => { win.style.opacity = '1'; out.innerHTML=''; boot(); }, 2000); 
    });
    minBtn.addEventListener('click', () => { win.classList.add('minimized'); taskbar.classList.remove('hidden'); });
    restoreBtn.addEventListener('click', () => { win.classList.remove('minimized'); taskbar.classList.add('hidden'); });

    boot();
});