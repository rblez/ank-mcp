import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();

export function registerBrowserTools(server) {

  server.tool("open_url",
    { url: z.string().describe("URL a abrir en el navegador del Android") },
    async ({ url }) => {
      try {
        run(`termux-open-url "${url}"`);
        return { content: [{ type: "text", text: `✅ Abierto: ${url}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("fetch_url",
    {
      url: z.string().describe("URL a hacer fetch"),
      headers: z.string().optional().describe("Header extra ej: 'Authorization: Bearer xxx'"),
    },
    async ({ url, headers }) => {
      try {
        const h = headers ? `-H "${headers}"` : "";
        const out = run(`curl -s -L --max-time 15 ${h} "${url}"`);
        const truncated = out.length > 8000 ? out.slice(0, 8000) + "\n...[truncado]" : out;
        return { content: [{ type: "text", text: truncated }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("download_file",
    {
      url: z.string().describe("URL del archivo"),
      dest: z.string().describe("Ruta destino ej: /sdcard/archivo.zip"),
    },
    async ({ url, dest }) => {
      try {
        run(`curl -L --max-time 60 -o "${dest}" "${url}"`);
        return { content: [{ type: "text", text: `✅ Descargado en: ${dest}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );
}
