import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();

export function registerBrowserTools(server) {

  server.tool("open_url",
    { url: z.string().describe("URL a abrir en el browser") },
    async ({ url }) => {
      try { run("termux-open-url "" + url + """); return { content: [{ type: "text", text: "✅ Abierto: " + url }] }; }
      catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  server.tool("fetch_url",
    { url: z.string(), headers: z.string().optional() },
    async ({ url, headers }) => {
      try {
        const h = headers ? "-H "" + headers + """ : "";
        const out = run("curl -s -L --max-time 15 " + h + " "" + url + """);
        const truncated = out.length > 8000 ? out.slice(0, 8000) + "
...[truncado]" : out;
        return { content: [{ type: "text", text: truncated }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  server.tool("download_file",
    { url: z.string(), dest: z.string().describe("Ruta destino ej: ~/archivo.zip") },
    async ({ url, dest }) => {
      try {
        run("curl -L --max-time 60 -o "" + dest + "" "" + url + """);
        return { content: [{ type: "text", text: "✅ Descargado: " + dest }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );
}
