# ⚡ Ank MCP — Universal Android Agent

**Control your Android device from any LLM via MCP (Model Context Protocol)**

Professional TUI CLI with slash commands for Termux and Android terminals.

[English](#english) | [Español](#español) | [Português](#portugues) | [Français](#francais) | [Deutsch](#deutsch) | [Italiano](#italiano) | [日本語](#日本語) | [中文](#中文)

---

## English {#english}

### 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install

# First-time setup
npm run setup

# Start interactive CLI with slash commands
npm run cli
```

### 💻 Slash Commands

| Command | Key | Description |
|---------|-----|-------------|
| `/help` | `?` | Show all available commands |
| `/status` | `s` | Show server status and URLs |
| `/start` | `1` | Start the MCP server |
| `/stop` | `0` | Stop the running server |
| `/settings` | `S` | Manage configuration settings |
| `/integrations` | `i` | LLM integration guides with copy-paste configs |
| `/export` | `e` | Export configuration to JSON |
| `/import` | `I` | Import configuration from JSON |
| `/logs` | `l` | View color-coded server logs |
| `/changes` | `c` | View changelog |
| `/tools` | `t` | List all available MCP tools |
| `/clear` | `x` | Clear the screen |
| `/exit` | `q` | Exit the application |

### 📋 Features

| Category | Tools |
|----------|-------|
| 📁 **Filesystem** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Browser** | `open_url`, `fetch_url`, `download_file` |
| 📦 **Apps** | `list_apps`, `open_app` |
| ℹ️ **System** | `system_info` |

### 🔧 Auto-Generated Variables

| Variable | Description |
|----------|-------------|
| `ANK_MCP_TOKEN` | Secure authentication token |
| `ANK_MCP_PORT` | Server port (default: 3000) |
| `ANK_MCP_URL` | Full MCP endpoint URL |
| `ANK_MCP_TUNNEL_URL` | Cloudflare tunnel URL |
| `ANK_MCP_LOCAL_URL` | Local network URL |
| `ANK_MCP_ALLOWED_PATHS` | Permitted filesystem paths |
| `ANK_MCP_ALLOW_SHELL` | Shell command permission |

### 🔗 Connect Your LLM

Use `/integrations` in the CLI for interactive setup guides.

**Claude.ai:**
1. Go to Settings → Integrations
2. Add Integration → Paste MCP URL

**Cursor / Windsurf:**
```json
{
  "ank-mcp": {
    "url": "YOUR_TUNNEL_URL/mcp?token=YOUR_TOKEN"
  }
}
```

### 📦 Requirements

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared** (optional): `pkg install cloudflared -y`
- **Termux:API** (optional): `pkg install termux-api -y`

---

## Español {#español}

### 🚀 Inicio Rápido

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 Comandos Slash

| Comando | Tecla | Descripción |
|---------|-------|-------------|
| `/help` | `?` | Mostrar todos los comandos |
| `/status` | `s` | Estado del servidor y URLs |
| `/start` | `1` | Iniciar servidor MCP |
| `/settings` | `S` | Gestionar configuración |
| `/integrations` | `i` | Guías de integración para LLMs |
| `/export` | `e` | Exportar configuración |
| `/import` | `I` | Importar configuración |
| `/logs` | `l` | Ver registros del servidor |
| `/changes` | `c` | Ver historial de cambios |
| `/tools` | `t` | Listar herramientas MCP |
| `/exit` | `q` | Salir de la aplicación |

### 📋 Características

| Categoría | Herramientas |
|-----------|--------------|
| 📁 **Sistema de Archivos** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Navegador** | `open_url`, `fetch_url`, `download_file` |
| 📦 **Aplicaciones** | `list_apps`, `open_app` |
| ℹ️ **Sistema** | `system_info` |

### 🔧 Variables Auto-Generadas

| Variable | Descripción |
|----------|-------------|
| `ANK_MCP_TOKEN` | Token de autenticación seguro |
| `ANK_MCP_PORT` | Puerto del servidor (defecto: 3000) |
| `ANK_MCP_URL` | URL completa del endpoint MCP |
| `ANK_MCP_TUNNEL_URL` | URL del túnel Cloudflare |
| `ANK_MCP_LOCAL_URL` | URL de red local |
| `ANK_MCP_ALLOWED_PATHS` | Rutas de archivo permitidas |
| `ANK_MCP_ALLOW_SHELL` | Permiso de comandos shell |

### 📦 Requisitos

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (opcional): `pkg install termux-api -y`

---

## Português {#portugues}

### 🚀 Início Rápido

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 Comandos Slash

| Comando | Tecla | Descrição |
|---------|-------|-----------|
| `/help` | `?` | Mostrar todos os comandos |
| `/status` | `s` | Status do servidor e URLs |
| `/start` | `1` | Iniciar servidor MCP |
| `/settings` | `S` | Gerenciar configurações |
| `/integrations` | `i` | Guias de integração para LLMs |
| `/export` | `e` | Exportar configuração |
| `/import` | `I` | Importar configuração |
| `/logs` | `l` | Ver logs do servidor |
| `/changes` | `c` | Ver histórico de mudanças |
| `/tools` | `t` | Listar ferramentas MCP |
| `/exit` | `q` | Sair do aplicativo |

### 📋 Recursos

| Categoria | Ferramentas |
|-----------|-------------|
| 📁 **Sistema de Arquivos** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Navegador** | `open_url`, `fetch_url`, `download_file` |
| 📦 **Apps** | `list_apps`, `open_app` |
| ℹ️ **Sistema** | `system_info` |

### 📦 Requisitos

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (opcional): `pkg install termux-api -y`

---

## Français {#francais}

### 🚀 Démarrage Rapide

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 Commandes Slash

| Commande | Touche | Description |
|----------|--------|-------------|
| `/help` | `?` | Afficher tous les commandes |
| `/status` | `s` | Statut du serveur et URLs |
| `/start` | `1` | Démarrer le serveur MCP |
| `/settings` | `S` | Gérer les paramètres |
| `/integrations` | `i` | Guides d'intégration LLM |
| `/export` | `e` | Exporter la configuration |
| `/import` | `I` | Importer la configuration |
| `/logs` | `l` | Voir les journaux |
| `/changes` | `c` | Voir l'historique |
| `/tools` | `t` | Lister les outils MCP |
| `/exit` | `q` | Quitter l'application |

### 📋 Fonctionnalités

| Catégorie | Outils |
|-----------|--------|
| 📁 **Système de Fichiers** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Navigateur** | `open_url`, `fetch_url`, `download_file` |
| 📦 **Apps** | `list_apps`, `open_app` |
| ℹ️ **Système** | `system_info` |

### 📦 Requirements

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (optionnel): `pkg install termux-api -y`

---

## Deutsch {#deutsch}

### 🚀 Schnellstart

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 Slash-Befehle

| Befehl | Taste | Beschreibung |
|--------|-------|--------------|
| `/help` | `?` | Alle Befehle anzeigen |
| `/status` | `s` | Serverstatus und URLs |
| `/start` | `1` | MCP-Server starten |
| `/settings` | `S` | Einstellungen verwalten |
| `/integrations` | `i` | LLM-Integrationsanleitungen |
| `/export` | `e` | Konfiguration exportieren |
| `/import` | `I` | Konfiguration importieren |
| `/logs` | `l` | Server-Logs anzeigen |
| `/changes` | `c` | Änderungsprotokoll |
| `/tools` | `t` | MCP-Tools auflisten |
| `/exit` | `q` | Anwendung beenden |

### 📋 Funktionen

| Kategorie | Tools |
|-----------|-------|
| 📁 **Dateisystem** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Browser** | `open_url`, `fetch_url`, `download_file` |
| 📦 **Apps** | `list_apps`, `open_app` |
| ℹ️ **System** | `system_info` |

### 📦 Anforderungen

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (optional): `pkg install termux-api -y`

---

## Italiano {#italiano}

### 🚀 Avvio Rapido

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 Comandi Slash

| Comando | Tasto | Descrizione |
|---------|-------|-------------|
| `/help` | `?` | Mostra tutti i comandi |
| `/status` | `s` | Stato server e URL |
| `/start` | `1` | Avvia server MCP |
| `/settings` | `S` | Gestisci impostazioni |
| `/integrations` | `i` | Guide integrazione LLM |
| `/export` | `e` | Esporta configurazione |
| `/import` | `I` | Importa configurazione |
| `/logs` | `l` | Visualizza log |
| `/changes` | `c` | Cronologia modifiche |
| `/tools` | `t` | Elenca strumenti MCP |
| `/exit` | `q` | Esci dall'applicazione |

### 📋 Funzionalità

| Categoria | Strumenti |
|-----------|-----------|
| 📁 **Filesystem** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **Browser** | `open_url`, `fetch_url`, `download_file` |
| 📦 **App** | `list_apps`, `open_app` |
| ℹ️ **Sistema** | `system_info` |

### 📦 Requisiti

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (opzionale): `pkg install termux-api -y`

---

## 日本語 {#日本語}

### 🚀 クイックスタート

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 スラッシュコマンド

| コマンド | キー | 説明 |
|----------|------|------|
| `/help` | `?` | すべてのコマンドを表示 |
| `/status` | `s` | サーバー状態と URL |
| `/start` | `1` | MCP サーバーを起動 |
| `/settings` | `S` | 設定を管理 |
| `/integrations` | `i` | LLM 統合ガイド |
| `/export` | `e` | 設定をエクスポート |
| `/import` | `I` | 設定をインポート |
| `/logs` | `l` | ログを表示 |
| `/changes` | `c` | 変更履歴 |
| `/tools` | `t` | MCP ツールを一覧 |
| `/exit` | `q` | アプリを終了 |

### 📋 機能

| カテゴリ | ツール |
|----------|--------|
| 📁 **ファイルシステム** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **シェル** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **ブラウザ** | `open_url`, `fetch_url`, `download_file` |
| 📦 **アプリ** | `list_apps`, `open_app` |
| ℹ️ **システム** | `system_info` |

### 📦 要件

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (オプション): `pkg install termux-api -y`

---

## 中文 {#中文}

### 🚀 快速开始

```bash
git clone https://github.com/rblez/ank-mcp
cd ank-mcp
npm install
npm run setup
npm run cli
```

### 💻 斜杠命令

| 命令 | 快捷键 | 说明 |
|------|--------|------|
| `/help` | `?` | 显示所有命令 |
| `/status` | `s` | 服务器状态和 URL |
| `/start` | `1` | 启动 MCP 服务器 |
| `/settings` | `S` | 管理配置 |
| `/integrations` | `i` | LLM 集成指南 |
| `/export` | `e` | 导出配置 |
| `/import` | `I` | 导入配置 |
| `/logs` | `l` | 查看日志 |
| `/changes` | `c` | 查看变更历史 |
| `/tools` | `t` | 列出 MCP 工具 |
| `/exit` | `q` | 退出应用 |

### 📋 功能

| 类别 | 工具 |
|------|------|
| 📁 **文件系统** | `list_files`, `read_file`, `write_file`, `create_dir`, `file_exists`, `delete_file` |
| 🐚 **Shell** | `run_command`, `run_background` |
| 📱 **Termux:API** | `battery_status`, `send_notification`, `vibrate`, `speak`, `clipboard_get`, `clipboard_set` |
| 🌐 **浏览器** | `open_url`, `fetch_url`, `download_file` |
| 📦 **应用** | `list_apps`, `open_app` |
| ℹ️ **系统** | `system_info` |

### 📦 要求

- **Termux** (Android)
- **Node.js** ≥ 18
- **cloudflared**: `pkg install cloudflared -y`
- **Termux:API** (可选): `pkg install termux-api -y`

---

## 🔒 Security

- **Token Authentication**: Bearer token required for all requests
- **Path Restrictions**: Only allowed paths accessible
- **Local Binding**: Server binds to 0.0.0.0 (Termux environment)
- **Tunnel Encryption**: Cloudflare provides HTTPS automatically

## 🎨 TUI Features

- **Monochromatic Theme**: Clean grayscale design
- **Alert Colors**: Red (error), Yellow (warn), Green (success), Cyan (info)
- **Slash Commands**: `/settings`, `/export`, `/integrations`, etc.
- **Markdown-style Responses**: Quoted messages and code blocks
- **Copy-paste Configs**: Ready-to-use LLM integration configs
- **Real-time Logs**: Color-coded log viewer
- **Interactive Menus**: Navigate with keyboard shortcuts

## 📝 License

MIT License — See [LICENSE](LICENSE) file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create Pull Request

## 📬 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Made with ❤️ for Termux + MCP**
