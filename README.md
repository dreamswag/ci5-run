# ⌨️ [ci5.run](https://ci5.run):~# terminal-native utilities 🖲️

### 💉 What's Here 
- `index.html` - Terminal-style command directory
- `scripts/` - Shell scripts for installation and utilities
- `_redirects` - Cloudflare Pages routing configuration

## Local Development
```bash
# Serve locally
python3 -m http.server 8000
# Open http://localhost:8000
```

## Deployment

Automatic via Cloudflare Pages:
- Push to `main` branch → Auto-deployed to ci5.run

## Security

All scripts are:
- Open source and auditable
- Served as `text/plain` (inspect before piping to bash)
- Checksummed and version-tagged

## Related Repos

- [ci5](https://github.com/dreamswag/ci5) - Main installation scripts and configs
- [ci5-docs](https://github.com/dreamswag/ci5-network) - Documentation / FAQ

- [ci5-host](https://github.com/dreamswag/ci5-host) - "TL;DR" Promotional Homepage

