import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { z } from "zod";

export function registerFilesystemTools(server, config) {
  const isAllowed = path => config.allowed_paths.some(p => path.startsWith(p));

  server.tool("list_files", { path: z.string() }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ Ruta no permitida" }] };
    const files = readdirSync(path).map(f => {
      try {
        const s = statSync(`${path}/${f}`);
        return `${s.isDirectory() ? "📁" : "📄"} ${f}`;
      } catch { return `❓ ${f}`; }
    });
    return { content: [{ type: "text", text: files.join("\n") || "(vacío)" }] };
  });

  server.tool("read_file", { path: z.string() }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ No permitido" }] };
    const text = readFileSync(path, "utf-8");
    return { content: [{ type: "text", text }] };
  });

  server.tool("write_file", { path: z.string(), content: z.string() }, async ({ path, content }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ No permitido" }] };
    writeFileSync(path, content, "utf-8");
    return { content: [{ type: "text", text: `✅ Guardado: ${path}` }] };
  });

  server.tool("create_dir", { path: z.string() }, async ({ path }) => {
    if (!isAllowed(path)) return { content: [{ type: "text", text: "❌ No permitido" }] };
    mkdirSync(path, { recursive: true });
    return { content: [{ type: "text", text: `✅ Carpeta creada: ${path}` }] };
  });

  server.tool("file_exists", { path: z.string() }, async ({ path }) => {
    return { content: [{ type: "text", text: existsSync(path) ? "✅ existe" : "❌ no existe" }] };
  });
}
