#!/usr/bin/env node
/**
 * Ank MCP - Quick Start Script
 * Starts server with TUI feedback
 */

import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import tui, { colors } from '../lib/tui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configPath = join(root, 'config.json');

// Get local IP
function getIP() {
  try {
    return execSync(
      "ifconfig 2>/dev/null | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1",
      { encoding: 'utf-8' }
    ).trim() || 'localhost';
  } catch { return 'localhost'; }
}

// Main
async function main() {
  tui.header('⚡ Ank MCP', 'Starting server...');

  // Check config
  if (!existsSync(configPath)) {
    tui.alert('warn', 'No configuration found', 'Run: npm run setup');
    process.exit(1);
  }

  const config = JSON.parse(await import('fs').then(m => m.readFileSync(configPath, 'utf-8')));

  // Check dependencies
  const spin1 = tui.spinner('Checking dependencies');
  try {
    execSync('npm list express', { cwd: root, stdio: 'ignore' });
    spin1.stop('Dependencies OK');
  } catch {
    spin1.fail('Missing dependencies');
    tui.info('Run: npm install');
    process.exit(1);
  }

  // Check cloudflared
  const spin2 = tui.spinner('Checking cloudflared');
  try {
    execSync('cloudflared --version', { stdio: 'ignore' });
    spin2.stop('cloudflared ready');
  } catch {
    spin2.stop('cloudflared not found (local only)');
  }

  // Start server
  console.log();
  const server = spawn('node', [join(root, 'server.js')], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let tunnelUrl = null;

  server.stdout.on('data', (data) => {
    const text = data.toString();
    
    // Extract tunnel URL
    const match = text.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com\/mcp\?token=[^\s]+/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[0];
      
      tui.clear();
      tui.header('✅ Server Ready', tunnelUrl);
      
      tui.section('Connection URLs');
      const localIp = getIP();
      const localUrl = `http://${localIp}:${config.port}/mcp?token=${config.token}`;
      
      tui.kvList([
        { label: 'Local', value: localUrl },
        { label: 'Tunnel', value: tunnelUrl },
      ]);

      tui.section('LLM Integration');
      tui.kvList([
        { label: 'Claude.ai', value: 'Settings → Integrations' },
        { label: 'Cursor', value: 'mcp.json' },
        { label: 'Windsurf', value: 'mcp.json' },
      ]);

      console.log();
      tui.alert('success', 'Ready to accept connections');
      console.log(colors.gray + 'Press Ctrl+C to stop' + colors.reset);
      console.log();
    }
  });

  server.stderr.on('data', (data) => {
    console.error(colors.red + data.toString() + colors.reset);
  });

  process.on('SIGINT', () => {
    server.kill();
    console.log();
    tui.alert('info', 'Server stopped', 'Goodbye!');
    process.exit(0);
  });
}

main().catch(err => {
  tui.alert('error', 'Startup failed', err.message);
  process.exit(1);
});
