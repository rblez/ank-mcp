import { execSync } from "child_process";

export function registerSystemTools(server) {
  server.tool("system_info", {}, async () => {
    const run = cmd => { try { return execSync(cmd).toString().trim(); } catch { return "n/a"; } };
    const lines = [
      `📱 IP local : ${run("ip addr show | grep 'inet ' | grep -v 127 | awk '{print $2}'")}`,
      `💾 Disco    : ${run("df -h /sdcard | tail -1")}`,
      `🧠 RAM      : ${run("free -m | grep Mem")}`,
      `⚡ Uptime   : ${run("uptime -p")}`,
      `📦 Node     : ${run("node -v")}`,
    ];
    return { content: [{ type: "text", text: lines.join("\n") }] };
  });
}
