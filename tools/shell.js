import { execSync } from "child_process";
import { z } from "zod";

export function registerShellTools(server, config) {
  if (!config.allow_shell) return;

  server.tool("run_command",
    { command: z.string().describe("Comando shell"), timeout: z.number().optional() },
    async ({ command, timeout = 15000 }) => {
      try {
        const out = execSync(command, {
          timeout, encoding: "utf-8",
          cwd: "/data/data/com.termux/files/home",
          env: { ...process.env, PATH: "/data/data/com.termux/files/usr/bin:" + process.env.PATH }
        });
        return { content: [{ type: "text", text: out || "(sin output)" }] };
      } catch (err) {
        return { content: [{ type: "text", text: "❌ " + (err.stdout || err.stderr || err.message) }] };
      }
    }
  );

  server.tool("run_background",
    { command: z.string(), logfile: z.string().optional() },
    async ({ command, logfile = "/data/data/com.termux/files/home/bg.log" }) => {
      try {
        execSync(`nohup sh -c '${command.replace(/'/g, "'\\''")}' >> ${logfile} 2>&1 &`);
        return { content: [{ type: "text", text: `✅ Corriendo en background. Log: ${logfile}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: "❌ " + err.message }] };
      }
    }
  );
}
