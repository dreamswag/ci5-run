document.addEventListener('DOMContentLoaded', async () => {
    const out = document.getElementById('terminalOutput');
    const input = document.getElementById('domainInput');
    const termWindow = document.getElementById('terminalWindow');
    const header = document.getElementById('headerHandle');
    
    const minBtn = document.getElementById('minBtn');
    const maxBtn = document.getElementById('maxBtn');
    const closeBtn = document.getElementById('closeBtn');
    const taskbar = document.getElementById('taskbar');
    const restoreBtn = document.getElementById('restoreBtn');

    // --- 1. SOVEREIGN MODE DETECTION ---
    // Detects if the site is loaded via IPFS, ENS, or Localhost.
    function isSovereignMode() {
        const h = window.location.hostname;
        return h.includes('ipfs') || h.includes('.eth') || h.includes('localhost') || h.includes('limo');
    }

    // Selection protection
    document.addEventListener('click', (e) => {
        const selection = window.getSelection();
        if (selection.type !== 'Range') {
            input.focus();
        }
    });

    // --- LIVE STATS LOGIC ---
    let globalCount = 0; // Start at 0 (Live State)
    
    async function fetchGlobalCount() {
        try {
            // In Sovereign Mode, the API might not be reachable if it relies on Cloudflare Workers.
            // We skip the fetch to prevent console errors, or try anyway.
            if (isSovereignMode()) return; 

            const res = await fetch('/api/stats'); 
            if (res.ok) {
                const data = await res.json();
                globalCount = data.count || globalCount;
            }
        } catch (e) {
            // Silently fail
        }
        updateStatusLine();
    }

    function updateStatusLine() {
        const statusEl = document.getElementById('live-status');
        if (statusEl) {
            statusEl.innerHTML = globalCount.toLocaleString();
        }
    }

    setInterval(fetchGlobalCount, 14777);


    const resizers = document.querySelectorAll('.resizer');
    let isResizing = false;
    
    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            termWindow.style.transition = 'none'; 

            const rect = termWindow.getBoundingClientRect();
            termWindow.style.width = rect.width + 'px';
            termWindow.style.height = rect.height + 'px';
            termWindow.style.left = rect.left + 'px';
            termWindow.style.top = rect.top + 'px';
            termWindow.style.transform = 'none';

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = rect.width;
            const startHeight = rect.height;
            const startTop = rect.top;
            const startLeft = rect.left;
            
            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                
                if (resizer.classList.contains('e') || resizer.classList.contains('ne') || resizer.classList.contains('se')) {
                    termWindow.style.width = `${startWidth + dx}px`;
                }
                if (resizer.classList.contains('s') || resizer.classList.contains('se') || resizer.classList.contains('sw')) {
                    termWindow.style.height = `${startHeight + dy}px`;
                }
                if (resizer.classList.contains('w') || resizer.classList.contains('nw') || resizer.classList.contains('sw')) {
                    termWindow.style.width = `${startWidth - dx}px`;
                    termWindow.style.left = `${startLeft + dx}px`;
                }
                if (resizer.classList.contains('n') || resizer.classList.contains('ne') || resizer.classList.contains('nw')) {
                    termWindow.style.height = `${startHeight - dy}px`;
                    termWindow.style.top = `${startTop + dy}px`;
                }
            };

            const onMouseUp = () => {
                isResizing = false;
                termWindow.style.transition = 'opacity 0.3s, transform 0.1s';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    let isDragging = false;
    let dragStartX, dragStartY, dragInitialLeft, dragInitialTop;

    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON' || isResizing) return;
        
        isDragging = true;
        header.style.cursor = 'grabbing';
        termWindow.style.transition = 'none';
        
        const rect = termWindow.getBoundingClientRect();
        termWindow.style.left = rect.left + 'px';
        termWindow.style.top = rect.top + 'px';
        termWindow.style.transform = 'none'; 
        termWindow.style.width = rect.width + 'px';
        termWindow.style.height = rect.height + 'px';

        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragInitialLeft = rect.left;
        dragInitialTop = rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        termWindow.style.left = `${dragInitialLeft + dx}px`;
        termWindow.style.top = `${dragInitialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        if(isDragging) {
            isDragging = false;
            header.style.cursor = 'default';
            termWindow.style.transition = 'opacity 0.3s, transform 0.1s';
        }
    });

    minBtn.addEventListener('click', () => {
        termWindow.classList.add('minimized');
        taskbar.classList.remove('hidden');
    });

    restoreBtn.addEventListener('click', () => {
        termWindow.classList.remove('minimized');
        taskbar.classList.add('hidden');
    });

    maxBtn.addEventListener('click', () => {
        termWindow.classList.toggle('maximized');
    });

    closeBtn.addEventListener('click', () => {
        termWindow.classList.add('closing-anim');
        setTimeout(() => {
            termWindow.style.display = 'none'; 
            termWindow.classList.remove('closing-anim');
            setTimeout(() => {
                termWindow.style.display = 'flex';
                termWindow.style.opacity = '0'; 
                termWindow.style.top = '50%';
                termWindow.style.left = '50%';
                termWindow.style.transform = 'translate(-50%, -50%)';
                termWindow.style.width = ''; 
                termWindow.style.height = ''; 
                termWindow.classList.remove('maximized', 'minimized');
                
                out.innerHTML = ''; 
                
                setTimeout(() => {
                    termWindow.style.transition = 'opacity 0.5s';
                    termWindow.style.opacity = '1';
                    setTimeout(() => {
                        termWindow.style.transition = 'opacity 0.3s, transform 0.1s';
                        init(); 
                    }, 500);
                }, 100);
            }, 4000); 
        }, 250); 
    });

    // --- TERMINAL BOOT & COMMANDS ---
    function getBootSequence() {
        // DEFINE COMMANDS BASED ON MODE
        // If Sovereign (IPFS/ENS), use direct GitHub Raw links.
        // If Standard (Cloudflare), use the vanity /free redirects.
        
        const isSov = isSovereignMode();
        
        // Base URLs
        const repoMain = "https://raw.githubusercontent.com/dreamswag/ci5/main";
        const repoRun = "https://raw.githubusercontent.com/dreamswag/ci5.run/main/scripts";
        const release = "https://github.com/dreamswag/ci5/releases/latest/download";

        // Construct command strings
        // Format: "curl URL | sh"
        const c_free = isSov ? `curl -L ${release}/install-full.sh | sh` : "curl ci5.run/free | sh";
        const c_fast = isSov ? `curl -L ${repoRun}/speedwiz.sh | sh` : "curl ci5.run/fast | sh";
        const c_heal = isSov ? `curl -L ${repoRun}/recover.sh | sh` : "curl ci5.run/heal | sh";
        const c_self = isSov ? `curl -L ${repoRun}/bone_marrow.sh | sh` : "curl ci5.run/self | sh";
        const c_pure = isSov ? `curl -L ${repoRun}/partial-uninstall.sh | sh` : "curl ci5.run/pure | sh";
        const c_true = isSov ? `curl -L ${repoMain}/validate.sh | sh` : "curl ci5.run/true | sh";
        const c_hide = isSov ? `curl -L ${repoRun}/paranoia_watchdog.sh | sh` : "curl ci5.run/hide | sh";
        const c_away = isSov ? `curl -L ${repoRun}/uninstall.sh | sh` : "curl ci5.run/away | sh";

        return [
            "<span class='green'>UPLINK ESTABLISHED.</span>",
            "IDENTITY: [<span class='red'>TELEMETRY_ERR:41</span><span id='glitch'>0</span>]",
            isSov ? "<span class='purple'>[ SOVEREIGN MIRROR ACTIVE ]</span>" : "",
            
            `OASIS CHECKPOINT: <span class='purple' id='live-status'>${globalCount.toLocaleString()}</span> SOVEREIGNS PASSED THROUGH`,
            "<span class='ghost'>...send word if you make it</span>", 
            
            "\n<span class='dim'>COMMAND PROTOCOLS</span>",
            "<span class='dim'>--------------------</span>",
            `  > <span class='cyan'>FREE</span>       ${c_free}`,
            `  > <span class='cyan'>FAST</span>       ${c_fast}`,
            `  > <span class='cyan'>HEAL</span>       ${c_heal}`,
            `  > <span class='cyan'>SELF</span>       ${c_self}`,
            `  > <span class='cyan'>PURE</span>       ${c_pure}`,
            `  > <span class='cyan'>TRUE</span>       ${c_true}`,
            // `  > <span class='cyan'>HOME</span>       curl ci5.run/home    <span class='dim'>| sh</span>`, // Tailscale (Future)
            `  > <span class='cyan'>HIDE</span>       ${c_hide}`,
            `  > <span class='red'>AWAY</span>       ${c_away}`,
            "\n"
        ];
    }

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
        await fetchGlobalCount();
        
        const boot = getBootSequence();
        for (let line of boot) {
            if(line === "") continue;
            
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

            if (['install', 'bootstrap'].includes(val)) out.innerHTML += `<span class='red'>Err: PARADIGM OBSOLETE. USE 'FREE'</span>\n`;
            else if (['speed', 'optimize'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'FAST'</span>\n`;
            else if (['debug', 'deep', 'far'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'SELF'</span>\n`;
            else if (['check', 'verify'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'TRUE'</span>\n`;
            else if (['clean', 'core', 'partial'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'PURE'</span>\n`;
            else if (['restore', 'fix', 'recover', 'forever'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'HEAL'</span>\n`;
            // else if (['vpn', 'remote', 'tailscale'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'HOME'</span>\n`;
            else if (['uninstall', 'nuke', 'off', 'flee'].includes(val)) out.innerHTML += `<span class='red'>Err: USE 'AWAY'</span>\n`;
            
            else if (val === 'free') out.innerHTML += `\n<span class='cyan'>LIBERATE / INITIALIZE:</span> <span class='white'>The primary transformation.</span>\n<span class='dim'>Nukes standard Pi OS networking and installs the Ci5 core routing engine.</span>\n<span class='dim'>RUN:</span> curl ci5.run/free | sh\n\n`;
            else if (val === 'fast') out.innerHTML += `\n<span class='cyan'>ACCELERATE / OPTIMIZE:</span> <span class='white'>Bandwidth discipline.</span>\n<span class='dim'>Executes local speed test and auto-tunes CAKE SQM limits.</span>\n<span class='dim'>RUN:</span> curl ci5.run/fast | sh\n\n`;
            else if (val === 'heal') out.innerHTML += `\n<span class='purple'>RESTORE / PERSIST:</span> <span class='white'>The emergency lifeline.</span>\n<span class='dim'>Restores fallback static IPs (192.168.1.1) and starts minimal DHCP.</span>\n<span class='dim'>RUN:</span> curl ci5.run/heal | sh\n\n`;
            else if (val === 'self') out.innerHTML += `\n<span class='purple'>INTROSPECT / DIAGNOSE:</span> <span class='white'>Generates the 'Bone Marrow' report.</span>\n<span class='dim'>Harvests kernel parameters and logs for troubleshooting.</span>\n<span class='dim'>RUN:</span> curl ci5.run/self | sh\n\n`;
            else if (val === 'pure') out.innerHTML += `\n<span class='cyan'>STRIP / CLEANSE:</span> <span class='white'>Granular extraction.</span>\n<span class='dim'>Removes high-overhead Docker services (Suricata, Ntopng) while keeping routing active.</span>\n<span class='dim'>RUN:</span> curl ci5.run/pure | sh\n\n`;
            else if (val === 'true') out.innerHTML += `\n<span class='purple'>ALIGN / VERIFY:</span> <span class='white'>The Golden Standard auditor.</span>\n<span class='dim'>Checks VLANs, hardware offloads, and qdiscs against reference.</span>\n<span class='dim'>RUN:</span> curl ci5.run/true | sh\n\n`;
            else if (val === 'hide') out.innerHTML += `\n<span class='red'>CLOAK / STEALTH:</span> <span class='white'>The fail-closed watchdog.</span>\n<span class='dim'>Kills WAN if Suricata IDS stops inspecting traffic.</span>\n<span class='dim'>RUN:</span> curl ci5.run/hide | sh\n\n`;
            else if (val === 'away') out.innerHTML += `\n<span class='red'>NUKE / UNINSTALL:</span> <span class='white'>Total reversal.</span>\n<span class='dim'>Reverts system networking back to ISP/OpenWrt defaults.</span>\n<span class='dim'>RUN:</span> curl ci5.run/away | sh\n\n`;
            
            else if (val === 'clear') out.textContent = ''; 
            else if (val !== '') out.innerHTML += `<span class='dim'>Err: Unknown command</span>\n`;
            
            out.scrollTop = out.scrollHeight;
        }
    });

    init();
});