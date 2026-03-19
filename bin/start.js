#!/usr/bin/env node
import { spawn, execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

if (!existsSync(join(root, 'node_modules', 'express'))) {
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { cwd: root, stdio: 'inherit' });
}

const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf-8'));

const LLMS = [
  { name: 'Claude',   url: 'https://claude.ai/settings/integrations' },
  { name: 'Cursor',   url: 'https://cursor.com/settings'             },
  { name: 'Windsurf', url: 'https://windsurf.com/settings'           },
  { name: 'Qwen',     url: 'https://qwen.ai'                         },
];

function getIP() {
  try {
    return execSync(
      "ifconfig 2>/dev/null | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1",
      { encoding: 'utf-8' }
    ).trim();
  } catch { return 'localhost'; }
}

function openURL(url) {
  try { execSync('termux-open-url "' + url + '"'); } catch {}
}

function showMenu(mcpUrl) {
  const line = '─'.repeat(58);
  console.log('\n' + line);
  console.log('⚡  Ank MCP — listo');
  console.log(line);
  console.log('\n🔗 URL MCP:');
  console.log('   ' + mcpUrl);
  console.log('\n🔑 Token : ' + config.token);
  console.log('\n' + line);
  console.log('\n¿Con qué LLM quieres conectar?\n');
  LLMS.forEach((llm, i) => console.log('  [' + (i + 1) + '] ' + llm.name));
  console.log('  [0] Saltar\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Elige y presiona Enter: ', (answer) => {
    rl.close();
    const idx = parseInt(answer) - 1;
    if (idx >= 0 && idx < LLMS.length) {
      const llm = LLMS[idx];
      console.log('\n🌐 Abriendo ' + llm.name + '...');
      console.log('   Pega esta URL en el campo MCP:');
      console.log('   ' + mcpUrl + '\n');
      openURL(llm.url);
    } else {
      console.log('\n✅ Servidor corriendo\n');
    }
  });
}

const server = spawn('node', [join(root, 'server.js')], { cwd: root, stdio: 'inherit' });

const cf = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:' + config.port], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;
const localUrl = 'http://' + getIP() + ':' + config.port + '/mcp?token=' + config.token;

const handle = (data) => {
  const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !urlFound) {
    urlFound = true;
    showMenu(match[0] + '/mcp?token=' + config.token);
  }
};

cf.stdout.on('data', handle);
cf.stderr.on('data', handle);
cf.on('error', () => { if (!urlFound) { urlFound = true; showMenu(localUrl); } });

setTimeout(() => { if (!urlFound) { urlFound = true; showMenu(localUrl); } }, 12000);

process.on('SIGINT', () => { server.kill(); cf.kill(); process.exit(0); });
