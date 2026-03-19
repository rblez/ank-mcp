import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync, spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { registerFilesystemTools } from "./tools/filesystem.js";
import { registerShellTools } from "./tools/shell.js";
import { registerSystemTools } from "./tools/system.js";
import { registerTermuxApiTools } from "./tools/termux-api.js";
import { registerBrowserTools } from "./tools/browser.js";
import { registerAppsTools } from "./tools/apps.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "config.json");
const envPath = join(__dirname, ".env");
const tunnelPath = join(__dirname, ".tunnel.json");

// Colors
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  brightCyan: '\x1b[96m',
  green: '\x1b[32m',
  brightGreen: '\x1b[92m',
  yellow: '\x1b[33m',
  brightYellow: '\x1b[93m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  bold: '\x1b[1m',
};

// Auto-create config if missing
function ensureConfig() {
  if (!existsSync(configPath)) {
    console.log(`${colors.gray}⚙️  Creating default config...${colors.reset}`);
    const token = generateToken();
    const config = {
      token,
      port: 3000,
      allowed_paths: ["/data/data/com.termux/files/home", "/sdcard"],
      allow_shell: true
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
    return config;
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789-";
  let token = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) token += "-";
    else token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function getLocalIP() {
  try {
    return execSync(
      "ifconfig 2>/dev/null | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1",
      { encoding: "utf-8" }
    ).trim() || "localhost";
  } catch { return "localhost"; }
}

function saveTunnelUrl(url) {
  writeFileSync(tunnelPath, JSON.stringify({ url, timestamp: Date.now() }, null, 2));
  updateEnvFile(url);
}

function loadTunnelUrl() {
  try {
    const data = JSON.parse(readFileSync(tunnelPath, "utf-8"));
    if (Date.now() - data.timestamp < 3600000) return data.url;
  } catch {}
  return null;
}

function updateEnvFile(tunnelUrl) {
  const config = ensureConfig();
  const localIp = getLocalIP();
  const localUrl = `http://${localIp}:${config.port}/mcp?token=${config.token}`;
  
  const envContent = `# Ank MCP Environment Variables
# Auto-generated

# Authentication
ANK_MCP_TOKEN=${config.token}
ANK_MCP_PORT=${config.port}

# URLs
ANK_MCP_LOCAL_URL=${localUrl}
ANK_MCP_TUNNEL_URL=${tunnelUrl || "not_configured"}
ANK_MCP_URL=${tunnelUrl || localUrl}

# Permissions
ANK_MCP_ALLOWED_PATHS=${config.allowed_paths.join(",")}
ANK_MCP_ALLOW_SHELL=${config.allow_shell}

# Generated
ANK_MCP_GENERATED_AT=${new Date().toISOString()}
ANK_MCP_UPDATED_AT=${new Date().toISOString()}
`;
  writeFileSync(envPath, envContent);
}

const config = ensureConfig();
const app = express();
app.use(express.json());

// ── Auth ──────────────────────────────────────────────
app.use((req, res, next) => {
  const bearer = req.headers["authorization"]?.replace("Bearer ", "");
  const query  = req.query.token;
  if (bearer !== config.token && query !== config.token) {
    return res.status(401).json({ error: "❌ Unauthorized" });
  }
  next();
});

// ── MCP endpoint ──────────────────────────────────────
app.all("/mcp", async (req, res) => {
  const server = new McpServer({ name: "ank-mcp", version: "1.0.0" });
  registerFilesystemTools(server, config);
  registerShellTools(server, config);
  registerSystemTools(server);
  registerTermuxApiTools(server);
  registerBrowserTools(server);
  registerAppsTools(server);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("finish", () => server.close().catch(() => {}));
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/", (req, res) => {
  const tunnelUrl = loadTunnelUrl();
  res.json({ 
    name: "Ank MCP", 
    version: "1.0.0", 
    endpoint: "/mcp", 
    status: "running",
    tunnel: tunnelUrl || "not_configured",
    local: `http://${getLocalIP()}:${config.port}/mcp?token=${config.token}`
  });
});

// ── Start cloudflared y captura la URL ────────────────
function startTunnel(port, token) {
  console.log(`\n${colors.gray}🌐 Starting Cloudflare tunnel...${colors.reset}`);

  const cf = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  let urlFound = false;

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
      urlFound = true;
      const tunnelUrl = match[0];
      const mcpUrl = `${tunnelUrl}/mcp?token=${token}`;

      saveTunnelUrl(mcpUrl);

      const line = "─".repeat(60);
      console.log(`\n${colors.gray}${line}${colors.reset}`);
      console.log(`${colors.bold}${colors.brightCyan}⚡ Ank MCP — READY${colors.reset}`);
      console.log(`${colors.gray}${line}${colors.reset}`);
      console.log(`\n${colors.bold}🔗 MCP URL:${colors.reset}\n   ${colors.cyan}${mcpUrl}${colors.reset}\n`);
      console.log(`${colors.bold}📋 CONNECTION INSTRUCTIONS:${colors.reset}`);
      console.log(`\n   ${colors.bold}Claude.ai:${colors.reset}`);
      console.log(`   Settings → Integrations → Add Integration`);
      console.log(`   URL: ${colors.cyan}${mcpUrl}${colors.reset}\n`);
      console.log(`   ${colors.bold}Cursor / Windsurf — add to mcp.json:${colors.reset}`);
      console.log(`   {`);
      console.log(`     "ank-mcp": {`);
      console.log(`       "url": "${colors.cyan}${mcpUrl}${colors.reset}"`);
      console.log(`     }`);
      console.log(`   }\n`);
      console.log(`   ${colors.bold}Qwen / any LLM with MCP:${colors.reset}`);
      console.log(`   Endpoint: ${colors.cyan}${mcpUrl}${colors.reset}`);
      console.log(`\n${colors.gray}${line}${colors.reset}`);
      console.log(`\n${colors.green}✅ Server active — LLM can verify with system_info${colors.reset}\n`);
    }
  };

  cf.stdout.on("data", handleOutput);
  cf.stderr.on("data", handleOutput);

  cf.on("error", () => {
    const localUrl = `http://${getLocalIP()}:${port}/mcp?token=${token}`;
    console.log(`${colors.yellow}⚠️  cloudflared not found. Install with: pkg install cloudflared -y${colors.reset}`);
    console.log(`${colors.gray}📡 Local: ${localUrl}${colors.reset}\n`);
    saveTunnelUrl(localUrl);
  });

  cf.on("close", () => {
    if (!urlFound) console.log(`${colors.yellow}⚠️  Tunnel closed.${colors.reset}`);
  });
}

// ── Start server ──────────────────────────────────────
app.listen(config.port, "0.0.0.0", () => {
  const line = "═".repeat(60);
  console.log(`\n${colors.gray}${line}${colors.reset}`);
  console.log(`${colors.bold}${colors.brightCyan}⚡ Ank MCP v1.0.0${colors.reset} — ${colors.gray}starting on port ${config.port}...${colors.reset}`);
  console.log(`${colors.gray}${line}${colors.reset}`);
  startTunnel(config.port, config.token);
});
