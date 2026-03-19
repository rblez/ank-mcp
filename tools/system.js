import { execSync } from "child_process";

const run = (cmd) => { try { return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim(); } catch { return "n/a"; } };

export function registerSystemTools(server) {
  server.tool("system_info", {}, async () => {
    const lines = [
      "📱 IP local  : " + run("ifconfig 2>/dev/null | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1"),
      "💾 Disco     : " + run("df -h /sdcard | tail -1"),
      "🧠 RAM       : " + run("free -m | grep Mem"),
      "⚡ Uptime    : " + run("uptime"),
      "📦 Node      : " + run("node -v"),
      "🐧 Kernel    : " + run("uname -r"),
    ];
    return { content: [{ type: "text", text: lines.join("\n") }] };
  });
}
