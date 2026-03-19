import { execSync } from "child_process";
import { z } from "zod";

const run = (cmd) => execSync(cmd, { encoding: "utf-8", timeout: 15000 }).trim();

export function registerTermuxApiTools(server) {

  server.tool("battery_status", {}, async () => {
    try {
      const out = run("termux-battery-status");
      return { content: [{ type: "text", text: out }] };
    } catch { return { content: [{ type: "text", text: "❌ Instala Termux:API — pkg install termux-api" }] }; }
  });

  server.tool("clipboard_get", {}, async () => {
    try {
      return { content: [{ type: "text", text: run("termux-clipboard-get") }] };
    } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
  });

  server.tool("clipboard_set",
    { text: z.string().describe("Texto a copiar al clipboard") },
    async ({ text }) => {
      try {
        execSync(`termux-clipboard-set`, { input: text, encoding: "utf-8" });
        return { content: [{ type: "text", text: "✅ Clipboard actualizado" }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("get_location", {}, async () => {
    try {
      const out = run("termux-location -p gps -r once");
      return { content: [{ type: "text", text: out }] };
    } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
  });

  server.tool("take_photo",
    { path: z.string().optional().describe("Ruta destino (default: /sdcard/mcp_photo.jpg)") },
    async ({ path = "/sdcard/mcp_photo.jpg" }) => {
      try {
        run(`termux-camera-photo -c 0 "${path}"`);
        return { content: [{ type: "text", text: `✅ Foto guardada: ${path}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("read_sms",
    { limit: z.number().optional().describe("Cantidad de SMS (default: 10)") },
    async ({ limit = 10 }) => {
      try {
        return { content: [{ type: "text", text: run(`termux-sms-list -l ${limit}`) }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("send_sms",
    {
      number: z.string().describe("Número destino"),
      message: z.string().describe("Mensaje a enviar"),
    },
    async ({ number, message }) => {
      try {
        execSync(`termux-sms-send -n "${number}"`, { input: message, encoding: "utf-8" });
        return { content: [{ type: "text", text: `✅ SMS enviado a ${number}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("list_contacts", {}, async () => {
    try {
      return { content: [{ type: "text", text: run("termux-contact-list") }] };
    } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
  });

  server.tool("send_notification",
    {
      title: z.string().describe("Título de la notificación"),
      content: z.string().describe("Cuerpo del mensaje"),
    },
    async ({ title, content }) => {
      try {
        run(`termux-notification --title "${title}" --content "${content}"`);
        return { content: [{ type: "text", text: "✅ Notificación enviada" }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("speak",
    {
      text: z.string().describe("Texto a leer en voz alta"),
      language: z.string().optional().describe("Idioma (default: es)"),
    },
    async ({ text, language = "es" }) => {
      try {
        execSync(`termux-tts-speak -l ${language}`, { input: text, encoding: "utf-8" });
        return { content: [{ type: "text", text: `🔊 Hablando...` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("wifi_info", {}, async () => {
    try {
      return { content: [{ type: "text", text: run("termux-wifi-connectioninfo") }] };
    } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
  });

  server.tool("torch",
    { on: z.boolean().describe("true = encender, false = apagar") },
    async ({ on }) => {
      try {
        run(`termux-torch ${on ? "on" : "off"}`);
        return { content: [{ type: "text", text: `🔦 Torch ${on ? "ON" : "OFF"}` }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );

  server.tool("vibrate",
    { duration: z.number().optional().describe("Duración en ms (default: 300)") },
    async ({ duration = 300 }) => {
      try {
        run(`termux-vibrate -d ${duration}`);
        return { content: [{ type: "text", text: "📳 Vibrado" }] };
      } catch (e) { return { content: [{ type: "text", text: `❌ ${e.message}` }] }; }
    }
  );
}
