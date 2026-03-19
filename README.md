# ⚡ Ank MCP

> Universal Android agent via MCP — control your Android from any LLM.

```
Claude ─┐
Cursor ─┤──→ Ank MCP Server ──→ Android (filesystem + shell + hardware)
Qwen   ─┤
Windsurf┘
```

Any LLM with MCP support can read files, run commands, and control your Android device — no root required.

---

## Requirements

- [Termux](https://f-droid.org/packages/com.termux/) from **F-Droid**
- [Termux:API](https://f-droid.org/packages/com.termux.api/) from **F-Droid** (for hardware tools)
- Node.js v18+ (`pkg install nodejs`)
- cloudflared (`pkg install cloudflared`)

---

## Install

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
```

---

## Configure

```bash
# Generate a secure token
node -e "console.log(crypto.randomUUID())"

# Edit config
nano config.json
```

```json
{
  "token": "YOUR-UUID-HERE",
  "port": 3000,
  "allowed_paths": ["/sdcard", "/data/data/com.termux/files/home"],
  "allow_shell": true
}
```

---

## Start

```bash
node server.js
```

The server will automatically:
1. Start the MCP server on port 3000
2. Launch a Cloudflare tunnel
3. Print the full MCP URL with connection instructions

```
⚡ Ank MCP v1.0.0
────────────────────────────────────────────────────────────
🔗 URL MCP:
   https://xxxx-xxxx.trycloudflare.com/mcp?token=YOUR-TOKEN

📋 INSTRUCCIONES PARA CONECTAR:

   Claude.ai:
   Settings → Integrations → Add Integration
   URL: https://xxxx-xxxx.trycloudflare.com/mcp?token=YOUR-TOKEN

   Cursor / Windsurf — mcp.json:
   { "ank-mcp": { "url": "https://xxxx.trycloudflare.com/mcp?token=YOUR-TOKEN" } }
```

---

## Tools (28 total)

| Category | Tools |
|----------|-------|
| 📁 **filesystem** | `list_files` `read_file` `write_file` `create_dir` `file_exists` `delete_file` |
| 🖥️ **shell** | `run_command` `run_background` |
| 📊 **system** | `system_info` |
| 📱 **termux-api** | `battery_status` `clipboard_get/set` `get_location` `take_photo` `read_sms` `send_sms` `list_contacts` `send_notification` `speak` `wifi_info` `torch` `vibrate` |
| 🌐 **browser** | `open_url` `fetch_url` `download_file` |
| 📦 **apps** | `list_apps` `open_app` `screenshot` `input_text` `tap` `swipe` `keyevent` |

---

## Author

**rblez** — [rblez.com](https://rblez.com) · [x.com/rblezX](https://x.com/rblezX) · [github.com/rblez](https://github.com/rblez)

> *72h beats 30 days* ⚡
