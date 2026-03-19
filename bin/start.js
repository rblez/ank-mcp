#!/usr/bin/env node
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const config = JSON.parse(readFileSync(join(root, "config.json"), "utf-8"));

console.log("\n⚡ Ank MCP — iniciando...\n");

const server = spawn("node", [join(root, "server.js")], { cwd: root, stdio: "inherit" });

setTimeout(() => {
  console.log("🌐 Iniciando Cloudflare tunnel...\n");
  const tunnel = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${config.port}`], {
    cwd: root, stdio: "inherit"
  });
  tunnel.on("error", () => console.log("⚠️  Instala cloudflared: pkg install cloudflared"));
}, 1500);

process.on("SIGINT", () => { console.log("\n👋 Ank MCP detenido"); server.kill(); process.exit(); });
