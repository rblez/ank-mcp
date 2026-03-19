import { execSync } from "child_process";
import { z } from "zod";

export function registerShellTools(server, config) {
  if (!config.allow_shell) return;

  server.tool(
    "run_command",
    {
      command: z.string(),
      timeout: z.number().optional()
    },
    async ({ command, timeout = 15000 }) => {
      try {
        const out = execSync(command, {
          timeout,
          encoding: "utf-8",
          cwd: "/data/data/com.termux/files/home"
        });
        return { content: [{ type: "text", text: out || "(sin output)" }] };
      } catch (err) {
        return { content: [{ type: "text", text: `❌ ${err.message}` }] };
      }
    }
  );
}
