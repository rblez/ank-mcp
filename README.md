# android-mcp 📱

> Control total de tu Android desde Claude — sin Claude Code, puro MCP.

```
Claude.ai Mobile  ──SSE/HTTP──▶  Termux Node.js  ──▶  Android FS + Shell
```

---

## ¿Qué es esto?

Un servidor **MCP (Model Context Protocol)** corriendo en **Termux** que expone tu sistema Android a Claude.ai. Leer archivos, escribir código, ejecutar comandos — todo desde el chat, autenticado con token único.

---

## Stack

| Pieza | Rol |
|-------|-----|
| **Termux** | Entorno Linux en Android |
| **Node.js v25+** | Runtime del servidor |
| **@modelcontextprotocol/sdk** | Protocolo MCP oficial |
| **Express** | HTTP + SSE transport |
| **Zod** | Validación de parámetros |

---

## Tools disponibles

| Tool | Descripción |
|------|-------------|
| `list_files` | Lista archivos de un directorio |
| `read_file` | Lee el contenido de un archivo |
| `write_file` | Escribe o sobreescribe un archivo |
| `create_dir` | Crea carpetas recursivamente |
| `file_exists` | Verifica si un path existe |
| `run_command` | Ejecuta comandos shell en Termux |
| `system_info` | IP, RAM, disco, uptime, versión Node |

---

## Instalación

### 1. Requisitos en Termux

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
```

### 2. Clonar y preparar

```bash
git clone https://github.com/rblez/android-mcp ~/android-mcp
cd ~/android-mcp
npm install
```

### 3. Configurar

```bash
# Genera tu token único
node -e "console.log(crypto.randomUUID())"

# Edita config.json con tu token
nano config.json
```

```json
{
  "token": "TU-UUID-AQUI",
  "port": 3000,
  "allowed_paths": [
    "/sdcard",
    "/data/data/com.termux/files/home"
  ],
  "allow_shell": true
}
```

### 4. Obtener tu IP

```bash
hostname -I
# Ejemplo: 10.99.92.58  (WiFi local)
#          100.x.x.x    (Tailscale — acceso remoto)
```

### 5. Arrancar

```bash
node server.js
```

```
🤖 Termux MCP listo
📡 http://10.99.92.58:3000/sse
🔑 Token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Conectar con Claude.ai

```
claude.ai → Settings → Integrations → Add Integration

URL:   http://TU_IP:3000/sse
Token: (el token de config.json)
```

> Requiere **Claude.ai Pro/Max**.

---

## Auto-start con Termux:Boot

```bash
pkg install termux-boot -y
mkdir -p ~/.termux/boot

cat > ~/.termux/boot/start-mcp.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
cd ~/android-mcp
node server.js >> ~/mcp.log 2>&1 &
EOF

chmod +x ~/.termux/boot/start-mcp.sh
```

El servidor arranca solo cada vez que reinicias el dispositivo.

---

## Acceso remoto con Tailscale

Si tienes Tailscale instalado en Android, usa la IP `100.x.x.x` en lugar de la IP local. Acceso seguro desde cualquier red sin ngrok ni túneles extra.

---

## Seguridad

- Autenticación por **Bearer Token** en cada request
- Rutas del filesystem restringidas por `allowed_paths` en config
- `allow_shell: false` para deshabilitar ejecución de comandos

---

## Estructura

```
android-mcp/
├── config.json       ← token + puertos + rutas permitidas
├── server.js         ← MCP server + SSE transport
├── tools/
│   ├── filesystem.js ← read/write/list/mkdir
│   ├── shell.js      ← run_command
│   └── system.js     ← system_info
└── package.json
```

---

## Autor

**rblez** — [rblez.com](https://rblez.com) · [x.com/rblezX](https://x.com/rblezX) · [github.com/rblez](https://github.com/rblez)

> *30d de programación vs 72h de trabajo rápido e inteligente* ⚡
