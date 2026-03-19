import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { readFileSync } from "fs";
import { registerFilesystemTools } from "./tools/filesystem.js";
import { registerShellTools } from "./tools/shell.js";
import { registerSystemTools } from "./tools/system.js";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const app = express();

app.use((req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (token !== config.token) return res.status(401).json({ error: "❌ Unauthorized" });
  next();
});

const server = new McpServer({ name: "termux-android-mcp", version: "1.0.0" });
registerFilesystemTools(server, config);
registerShellTools(server, config);
registerSystemTools(server);

const transports = {};

app.get("/sse", async (req, res) => {
  const t = new SSEServerTransport("/messages", res);
  transports[t.sessionId] = t;
  res.on("close", () => delete transports[t.sessionId]);
  await server.connect(t);
});

app.post("/messages", express.json(), async (req, res) => {
  const t = transports[req.query.sessionId];
  if (!t) return res.status(404).json({ error: "Session not found" });
  await t.handlePostMessage(req, res);
});

app.listen(config.port, "0.0.0.0", () => {
  const ip = (() => { try { return require("child_process").execSync("ip addr show | grep 'inet ' | grep -v 127 | awk '{print $2}' | cut -d/ -f1").toString().trim(); } catch { return "TU_IP"; } })();
  console.log(`\n🤖 Termux MCP listo`);
  console.log(`📡 http://${ip}:${config.port}/sse`);
  console.log(`🔑 Token: ${config.token}\n`);
});
