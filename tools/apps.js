import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();

export function registerAppsTools(server) {

  server.tool("list_apps",
    { filter: z.string().optional().describe("Filtro por nombre ej: com.google") },
    async ({ filter = "" }) => {
      try {
        const cmd = filter
          ? `pm list packages | grep "${filter}"`
          : "pm list packages";
        return { content: [{ type: "text", text: run(cmd) }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("open_app",
    { package: z.string().describe("Package name ej: com.whatsapp") },
    async ({ package: pkg }) => {
      try {
        run(`monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`);
        return { content: [{ type: "text", text: `✅ Abriendo ${pkg}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("screenshot",
    { path: z.string().optional().describe("Ruta destino (default: /sdcard/screenshot.png)") },
    async ({ path = "/sdcard/screenshot.png" }) => {
      try {
        run(`screencap -p "${path}"`);
        return { content: [{ type: "text", text: `✅ Screenshot: ${path}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("input_text",
    { text: z.string().describe("Texto a escribir en el campo activo") },
    async ({ text }) => {
      try {
        const escaped = text.replace(/ /g, "%s").replace(/'/g, "");
        run(`input text "${escaped}"`);
        return { content: [{ type: "text", text: "✅ Texto ingresado" }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("tap",
    {
      x: z.number().describe("Coordenada X"),
      y: z.number().describe("Coordenada Y"),
    },
    async ({ x, y }) => {
      try {
        run(`input tap ${x} ${y}`);
        return { content: [{ type: "text", text: `✅ Tap en (${x}, ${y})` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("swipe",
    {
      x1: z.number(), y1: z.number(),
      x2: z.number(), y2: z.number(),
      duration: z.number().optional().describe("ms (default: 300)"),
    },
    async ({ x1, y1, x2, y2, duration = 300 }) => {
      try {
        run(`input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
        return { content: [{ type: "text", text: `✅ Swipe (${x1},${y1}) → (${x2},${y2})` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("keyevent",
    { key: z.number().describe("Android keycode: 3=HOME 4=BACK 26=POWER 24=VOL+ 25=VOL-") },
    async ({ key }) => {
      try {
        run(`input keyevent ${key}`);
        return { content: [{ type: "text", text: `✅ Keyevent ${key}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );
}
