###### 📟 [ci5.run](https://github.com/dreamswag/ci5.run): curl ~ 🔬 [ci5.host](https://github.com/dreamswag/ci5.host): cure ~ 🧪 [ci5.dev](https://github.com/dreamswag/ci5.dev): cork ~ 🥼 [ci5.network](https://github.com/dreamswag/ci5.network): cert ~ 📡[ci5](https://github.com/dreamswag/ci5)🛰️
# 📟 [ci5.run](https://ci5.run):~# curl ⌨️

## 🛣️ Commands

| Route | Script | Purpose |
|-------|--------|---------|
| `/FREE` | `install-full.sh` | Full Stack (IDS + Corks) |
| `/4EVR` | `install-lite.sh` | Minimal (DNS + SQM only) |
| `/CORK` | `cork.sh` | Registry Search (Corks) |
| `/FAST` | `speed_wizard.sh` | Bufferbloat SQM Configuration (Auto + Manual) |
| `/TRUE` | `dock_guard.sh` | Toggle Docker Auto-Update (Full Stack) |
| `/VOID` | `uninstall.sh` | Remove Ci5 |


## ⚡ Execute (on Pi 5)

```bash
curl ci5.run/free | sh
```

**Underlying Process:**

1. Downloads Golden Image to RAM
2. Flashes to SD/USB
3. Injects your config ( "*Soul*" )
4. Reboots into Ci5

---

## 🔐 Security Model

All scripts are:
- **Open Source**: inspect before execution
- **Served via `text/plain`**: readable pre-bash
- **Checksummed**: verify against releases

```bash
# Inspect before running
curl ci5.run/free | less
```

---

## 🔌 Offline Installation

Don't trust curl pipes? Clone and inspect:

```bash
git clone https://github.com/dreamswag/ci5
cd ci5
less install-full.sh
sh install-full.sh
```

📚 **[Manual Installation Guide →](https://github.com/dreamswag/ci5.network/blob/main/docs/OFFLINE_INSTALL.md)**

---

## 📁 Repository Structure

```
ci5.run/
├── index.html          # "Phone Book" for Pi 5 terminal commands
├── _redirects          # Cloudflare routing
├── scripts/
│   ├── bootstrap.sh    # Phoenix Protocol (Debian → Nukes Storage → Installs OpenWrt → Ci5)
│   └── debug.sh        # Diagnostic dump
└── static/
    ├── script.js       # Terminal UI
    └── style.css       # Terminal UI
```
