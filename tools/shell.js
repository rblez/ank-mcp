import { execSync } from "child_process";
import { z } from "zod";

export function registerShellTools(server, config) {
  if (!config.allow_shell) return;

  server.tool("run_command",
    {
      command: z.string().describe("Comando shell a ejecutar"),
      timeout: z.number().optional().describe("Timeout en ms (default 15000)"),
    },
    async ({ command, timeout = 15000 }) => {
      try {
        const out = execSync(command, {
          timeout,
          encoding: "utf-8",
          cwd: "/data/data/com.termux/files/home",
          env: { ...process.env, PATH: "/data/data/com.termux/files/usr/bin:" + process.env.PATH },
        });
        return { content: [{ type: "text", text: out || "(sin output)" }] };
      } catch (err) {
        const msg = err.stdout || err.stderr || err.message;
        return { content: [{ type: "text", text: `❌ ${msg}` }] };
      }
    }
  );

  server.tool("run_background",
    {
      command: z.string().describe("Comando a ejecutar en background"),
      logfile: z.string().optional().describe("Archivo de log (default: ~/bg.log)"),
    },
    async ({ command, logfile = "/data/data/com.termux/files/home/bg.log" }) => {
      try {
        execSync(`nohup sh -c '${command}' >> ${logfile} 2>&1 &`);
        return { content: [{ type: "text", text: `✅ Corriendo en background. Log: ${logfile}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `❌ ${err.message}` }] };
      }
    }
  );
}
