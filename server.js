import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { readFileSync } from "fs";
import { execSync, spawn } from "child_process";

import { registerFilesystemTools } from "./tools/filesystem.js";
import { registerShellTools } from "./tools/shell.js";
import { registerSystemTools } from "./tools/system.js";
import { registerTermuxApiTools } from "./tools/termux-api.js";
import { registerBrowserTools } from "./tools/browser.js";
import { registerAppsTools } from "./tools/apps.js";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
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
  res.json({ name: "Ank MCP", version: "1.0.0", endpoint: "/mcp", status: "running" });
});

// ── Start cloudflared y captura la URL ────────────────
function startTunnel(port, token) {
  const line = "─".repeat(60);
  console.log("\n🌐 Iniciando Cloudflare tunnel...");

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

      console.log(`\n${line}`);
      console.log(`⚡ Ank MCP — LISTO`);
      console.log(line);
      console.log(`\n🔗 URL MCP:\n   ${mcpUrl}\n`);
      console.log(`📋 INSTRUCCIONES PARA CONECTAR:`);
      console.log(`\n   Claude.ai:`);
      console.log(`   Settings → Integrations → Add Integration`);
      console.log(`   URL: ${mcpUrl}\n`);
      console.log(`   Cursor / Windsurf — agregar a mcp.json:`);
      console.log(`   {`);
      console.log(`     "ank-mcp": {`);
      console.log(`       "url": "${mcpUrl}"`);
      console.log(`     }`);
      console.log(`   }\n`);
      console.log(`   Qwen / cualquier LLM con MCP:`);
      console.log(`   Endpoint: ${mcpUrl}`);
      console.log(`\n${line}`);
      console.log(`\n✅ Servidor activo — el LLM puede verificar con system_info\n`);
    }
  };

  cf.stdout.on("data", handleOutput);
  cf.stderr.on("data", handleOutput);

  cf.on("error", () => {
    console.log("⚠️  cloudflared no encontrado. Instala con: pkg install cloudflared -y");
    console.log(`📡 Local: http://localhost:${port}/mcp?token=${token}\n`);
  });

  cf.on("close", () => {
    if (!urlFound) console.log("⚠️  Tunnel cerrado.");
  });
}

// ── Start server ──────────────────────────────────────
app.listen(config.port, "0.0.0.0", () => {
  console.log(`\n⚡ Ank MCP v1.0.0 — arrancando en puerto ${config.port}...`);
  startTunnel(config.port, config.token);
});
