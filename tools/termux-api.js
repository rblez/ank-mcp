import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 15000 }).trim();

export function registerTermuxApiTools(server) {

  // ✅ FUNCIONA — via Termux:API
  server.tool("battery_status", {}, async () => {
    try { return { content: [{ type: "text", text: run("termux-battery-status") }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  // ✅ FUNCIONA
  server.tool("send_notification",
    { title: z.string(), content: z.string() },
    async ({ title, content }) => {
      try {
        run("termux-notification --title "" + title + "" --content "" + content + """);
        return { content: [{ type: "text", text: "✅ Notificación enviada" }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  // ✅ FUNCIONA
  server.tool("vibrate",
    { duration: z.number().optional().describe("ms (default 300)") },
    async ({ duration = 300 }) => {
      try { run("termux-vibrate -d " + duration); return { content: [{ type: "text", text: "📳 Vibrado" }] }; }
      catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  // ✅ FUNCIONA
  server.tool("speak",
    { text: z.string(), language: z.string().optional() },
    async ({ text, language = "es" }) => {
      try {
        execSync("termux-tts-speak -l " + language, { input: text, encoding: "utf-8" });
        return { content: [{ type: "text", text: "🔊 Hablando..." }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );

  // ✅ FUNCIONA
  server.tool("clipboard_get", {}, async () => {
    try { return { content: [{ type: "text", text: run("termux-clipboard-get") || "(vacío)" }] }; }
    catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
  });

  server.tool("clipboard_set",
    { text: z.string() },
    async ({ text }) => {
      try {
        execSync("termux-clipboard-set", { input: text, encoding: "utf-8" });
        return { content: [{ type: "text", text: "✅ Clipboard actualizado" }] };
      } catch (e) { return { content: [{ type: "text", text: "❌ " + e.message }] }; }
    }
  );
}
