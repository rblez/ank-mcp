import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { z } from "zod";

export function registerFilesystemTools(server, config) {
  const isAllowed = (path) => config.allowed_paths.some((p) => path.startsWith(p));

  server.tool("list_files", { path: z.string().describe("Directorio a listar") }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    try {
      const files = readdirSync(path).map((f) => {
        try { const s = statSync(path + "/" + f); return (s.isDirectory() ? "📁 " : "📄 ") + f; }
        catch { return "❓ " + f; }
      });
      return { content: [{ type: "text", text: files.join("
") || "(vacío)" }] };
    } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  server.tool("read_file", { path: z.string().describe("Ruta del archivo") }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    try { return { content: [{ type: "text", text: readFileSync(path, "utf-8") }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  server.tool("write_file", { path: z.string(), content: z.string() }, async ({ path, content }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    try { writeFileSync(path, content, "utf-8"); return { content: [{ type: "text", text: "✅ Guardado: " + path }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  server.tool("create_dir", { path: z.string() }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    try { mkdirSync(path, { recursive: true }); return { content: [{ type: "text", text: "✅ Creado: " + path }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  server.tool("file_exists", { path: z.string() }, async ({ path }) => ({
    content: [{ type: "text", text: existsSync(path) ? "✅ existe" : "❌ no existe" }]
  }));

  server.tool("delete_file", { path: z.string() }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    try { unlinkSync(path); return { content: [{ type: "text", text: "✅ Eliminado: " + path }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });
}
