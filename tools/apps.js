import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();

export function registerAppsTools(server) {

  // ✅ FUNCIONA
  server.tool("list_apps",
    { filter: z.string().optional().describe("Filtro ej: com.google") },
    async ({ filter = "" }) => {
      try {
        const out = filter ? run("pm list packages | grep "" + filter + """) : run("pm list packages");
        return { content: [{ type: "text", text: out }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  // ✅ FUNCIONA
  server.tool("open_app",
    { package: z.string().describe("Package name ej: com.whatsapp") },
    async ({ package: pkg }) => {
      try {
        run("monkey -p " + pkg + " -c android.intent.category.LAUNCHER 1");
        return { content: [{ type: "text", text: "✅ Abriendo " + pkg }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );
}
