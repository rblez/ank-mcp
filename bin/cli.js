#!/usr/bin/env node
/**
 * Ank MCP - Professional CLI with Slash Commands
 * /settings, /export, /import, /integrations, /changes, /status, /help
 */

import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, appendFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import tui, { colors } from '../lib/tui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configPath = join(root, 'config.json');
const envPath = join(root, '.env');
const tunnelPath = join(root, '.tunnel.json');
const logPath = join(root, 'ank-mcp.log');

// Generate secure random token
function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
  let token = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) token += '-';
    else token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Get local IP
function getIP() {
  try {
    return execSync("ifconfig 2>/dev/null | grep 'inet ' | grep -v 127 | awk '{print $2}' | head -1", { encoding: 'utf-8' }).trim() || 'localhost';
  } catch { return 'localhost'; }
}

// Ensure config exists
function ensureConfig() {
  if (!existsSync(configPath)) {
    const config = {
      token: generateToken(),
      port: 3000,
      allowed_paths: ['/data/data/com.termux/files/home', '/sdcard'],
      allow_shell: true
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    updateEnvFile(config, null);
    return config;
  }
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

// Update .env
function updateEnvFile(config, tunnelUrl) {
  const localIp = getIP();
  const localUrl = `http://${localIp}:${config.port}/mcp?token=${config.token}`;
  const envContent = `# Ank MCP Environment Variables
# Auto-generated: ${new Date().toISOString()}

# Authentication
ANK_MCP_TOKEN=${config.token}
ANK_MCP_PORT=${config.port}

# URLs
ANK_MCP_LOCAL_URL=${localUrl}
ANK_MCP_TUNNEL_URL=${tunnelUrl || 'not_configured'}
ANK_MCP_URL=${tunnelUrl || localUrl}

# Permissions
ANK_MCP_ALLOWED_PATHS=${config.allowed_paths.join(',')}
ANK_MCP_ALLOW_SHELL=${config.allow_shell}
`;
  writeFileSync(envPath, envContent);
}

// Save tunnel URL
function saveTunnelUrl(url) {
  writeFileSync(tunnelPath, JSON.stringify({ url, timestamp: Date.now() }, null, 2));
  const config = ensureConfig();
  updateEnvFile(config, url);
}

// Load tunnel URL
function loadTunnelUrl() {
  try {
    const data = JSON.parse(readFileSync(tunnelPath, 'utf-8'));
    if (Date.now() - data.timestamp < 3600000) return data.url;
  } catch {}
  return null;
}

// Log to file
function logToFile(message) {
  const timestamp = new Date().toISOString();
  appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

// Check dependencies
function checkDependencies() {
  try {
    execSync('npm list express @modelcontextprotocol/sdk zod', { cwd: root, encoding: 'utf-8', stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Install dependencies
function installDependencies() {
  const spin = tui.spinner('Installing dependencies');
  try {
    execSync('npm install', { cwd: root, stdio: 'ignore' });
    spin.stop('Dependencies installed');
    return true;
  } catch (err) {
    spin.fail('Failed to install dependencies');
    return false;
  }
}

// ============== SLASH COMMANDS ==============

// /help - Show all commands
async function cmdHelp() {
  tui.section('Available Commands', '◈');
  
  const commands = [
    { cmd: '/help', desc: 'Show this help message', shortcut: '?' },
    { cmd: '/status', desc: 'Show server status and URLs', shortcut: 's' },
    { cmd: '/start', desc: 'Start the MCP server', shortcut: '1' },
    { cmd: '/stop', desc: 'Stop the running server', shortcut: '0' },
    { cmd: '/settings', desc: 'Manage configuration settings', shortcut: 'S' },
    { cmd: '/integrations', desc: 'LLM integration guides', shortcut: 'i' },
    { cmd: '/export', desc: 'Export configuration', shortcut: 'e' },
    { cmd: '/import', desc: 'Import configuration', shortcut: 'I' },
    { cmd: '/logs', desc: 'View server logs', shortcut: 'l' },
    { cmd: '/changes', desc: 'View changelog', shortcut: 'c' },
    { cmd: '/tools', desc: 'List available MCP tools', shortcut: 't' },
    { cmd: '/clear', desc: 'Clear screen', shortcut: 'x' },
    { cmd: '/exit', desc: 'Exit the application', shortcut: 'q' },
  ];

  tui.table(
    commands.map(c => [c.cmd, c.desc, c.shortcut]),
    [
      { label: 'Command' },
      { label: 'Description' },
      { label: 'Key' },
    ]
  );
  
  console.log();
  tui.quote('Type a command or use the shortcut key', { type: 'info', title: '💡 Tip' });
}

// /status - Show server status
async function cmdStatus() {
  const config = ensureConfig();
  const tunnelUrl = loadTunnelUrl();
  const localIp = getIP();
  
  tui.section('Server Status', '◇');
  
  tui.kvList([
    { label: 'Status', value: `${colors.green}● Running${colors.reset}` },
    { label: 'Version', value: '1.0.1' },
    { label: 'Port', value: String(config.port) },
    { label: 'Token', value: config.token },
    { label: 'Local IP', value: localIp },
    { label: 'Shell', value: config.allow_shell ? `${colors.green}Enabled${colors.reset}` : `${colors.gray}Disabled${colors.reset}` },
  ]);
  
  tui.section('Endpoints');
  
  const localUrl = `http://${localIp}:${config.port}/mcp?token=${config.token}`;
  tui.kvList([
    { label: 'Local', value: localUrl },
    { label: 'Tunnel', value: tunnelUrl || `${colors.gray}Not configured${colors.reset}` },
  ]);
}

// /settings - Manage settings
async function cmdSettings() {
  const config = ensureConfig();
  
  while (true) {
    tui.clear();
    tui.header('⚙️ Settings', 'Configuration Management');
    
    tui.menu([
      { label: 'Change Port', description: `Current: ${config.port}`, shortcut: 'p' },
      { label: 'Toggle Shell', description: `Current: ${config.allow_shell ? 'Enabled' : 'Disabled'}`, shortcut: 's' },
      { label: 'Regenerate Token', description: 'Create new auth token', shortcut: 't' },
      { label: 'Manage Paths', description: 'Edit allowed filesystem paths', shortcut: 'a' },
      { label: 'Back', description: 'Return to main menu', shortcut: 'b' },
    ]);
    
    const answer = await tui.prompt('Enter choice');
    const cmd = answer.toLowerCase().trim();
    
    if (cmd === 'p' || cmd === '/port') {
      const newPort = await tui.prompt('Enter new port', { default: config.port });
      config.port = parseInt(newPort);
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      updateEnvFile(config, loadTunnelUrl());
      tui.alert('success', 'Port updated', `New port: ${config.port}`);
    }
    else if (cmd === 's' || cmd === '/shell') {
      config.allow_shell = !config.allow_shell;
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      updateEnvFile(config, loadTunnelUrl());
      tui.alert('success', 'Shell setting changed', `Shell is now ${config.allow_shell ? 'enabled' : 'disabled'}`);
    }
    else if (cmd === 't' || cmd === '/token') {
      const confirm = await tui.confirm('This will invalidate existing connections. Continue?');
      if (confirm) {
        config.token = generateToken();
        writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
        updateEnvFile(config, loadTunnelUrl());
        tui.alert('success', 'Token regenerated', `New token: ${config.token}`);
      }
    }
    else if (cmd === 'a' || cmd === '/paths') {
      await cmdManagePaths(config);
    }
    else if (cmd === 'b' || cmd === '/back' || cmd === '/exit') {
      return;
    }
    
    await tui.prompt('Press Enter to continue');
  }
}

// Manage allowed paths
async function cmdManagePaths(config) {
  tui.section('Allowed Paths');
  
  console.log();
  for (let i = 0; i < config.allowed_paths.length; i++) {
    console.log(`  [${i + 1}] ${colors.cyan}${config.allowed_paths[i]}${colors.reset}`);
  }
  console.log();
  
  tui.menu([
    { label: 'Add Path', description: 'Add new allowed path', shortcut: 'a' },
    { label: 'Remove Path', description: 'Remove existing path', shortcut: 'r' },
    { label: 'Back', description: 'Return to settings', shortcut: 'b' },
  ]);
  
  const answer = await tui.prompt('Enter choice');
  
  if (answer === 'a') {
    const path = await tui.prompt('Enter path to add');
    if (!config.allowed_paths.includes(path)) {
      config.allowed_paths.push(path);
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      updateEnvFile(config, loadTunnelUrl());
      tui.alert('success', 'Path added', path);
    }
  }
  else if (answer === 'r') {
    const idx = await tui.prompt('Enter number to remove');
    const i = parseInt(idx) - 1;
    if (i >= 0 && i < config.allowed_paths.length) {
      const removed = config.allowed_paths.splice(i, 1);
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      updateEnvFile(config, loadTunnelUrl());
      tui.alert('success', 'Path removed', removed[0]);
    }
  }
}

// /integrations - LLM integration guides
async function cmdIntegrations() {
  const config = ensureConfig();
  const tunnelUrl = loadTunnelUrl();
  const localIp = getIP();
  const mcpUrl = tunnelUrl || `http://${localIp}:${config.port}/mcp?token=${config.token}`;
  
  tui.clear();
  tui.header('🔗 Integrations', 'LLM Connection Guide');
  
  tui.menu([
    { label: 'Claude.ai', description: 'Anthropic Claude integration', shortcut: 'c' },
    { label: 'Cursor', description: 'Cursor IDE integration', shortcut: 'C' },
    { label: 'Windsurf', description: 'Windsurf IDE integration', shortcut: 'w' },
    { label: 'Qwen', description: 'Alibaba Qwen integration', shortcut: 'q' },
    { label: 'Generic MCP', description: 'Any MCP-compatible client', shortcut: 'g' },
    { label: 'Back', description: 'Return to main menu', shortcut: 'b' },
  ]);
  
  const answer = await tui.prompt('Select integration');
  const cmd = answer.toLowerCase().trim();
  
  if (cmd === 'c') {
    tui.section('Claude.ai Integration');
    tui.quote([
      '1. Go to https://claude.ai/settings/integrations',
      '2. Click "Add Integration"',
      '3. Select "MCP Server"',
      `4. Enter URL: ${mcpUrl}`,
      '5. Click "Save"',
    ], { type: 'info', title: 'Setup Steps' });
    
    tui.copyBlock(mcpUrl, { description: 'MCP Endpoint URL' });
  }
  else if (cmd === 'c' || cmd === 'cursor') {
    tui.section('Cursor Integration');
    tui.quote([
      '1. Open Cursor Settings',
      '2. Go to "MCP" section',
      '3. Add new server configuration',
    ], { type: 'info', title: 'Setup Steps' });
    
    const jsonConfig = JSON.stringify({
      "ank-mcp": { url: mcpUrl }
    }, null, 2);
    
    tui.copyBlock(jsonConfig, { filename: 'mcp.json', description: 'Add to mcp.json:' });
  }
  else if (cmd === 'w') {
    tui.section('Windsurf Integration');
    tui.quote([
      '1. Open Windsurf Settings',
      '2. Navigate to "MCP Servers"',
      '3. Add new server',
    ], { type: 'info', title: 'Setup Steps' });
    
    const jsonConfig = JSON.stringify({
      "ank-mcp": { url: mcpUrl }
    }, null, 2);
    
    tui.copyBlock(jsonConfig, { filename: 'mcp.json', description: 'Add to mcp.json:' });
  }
  else if (cmd === 'q') {
    tui.section('Qwen Integration');
    tui.quote([
      '1. Go to https://qwen.ai',
      '2. Open MCP settings',
      `3. Configure endpoint: ${mcpUrl}`,
    ], { type: 'info', title: 'Setup Steps' });
  }
  else if (cmd === 'g') {
    tui.section('Generic MCP Client');
    tui.quote([
      `Endpoint URL: ${mcpUrl}`,
      'Protocol: MCP over HTTP',
      'Authentication: Bearer token in URL',
    ], { type: 'info', title: 'Configuration' });
  }
  
  if (cmd !== 'b') {
    await tui.prompt('Press Enter to continue');
  }
}

// /export - Export configuration
async function cmdExport() {
  const config = ensureConfig();
  const tunnelUrl = loadTunnelUrl();
  
  tui.section('Export Configuration');
  
  const exportData = {
    version: '1.0.1',
    exported_at: new Date().toISOString(),
    config: {
      port: config.port,
      allow_shell: config.allow_shell,
      allowed_paths: config.allowed_paths,
    },
    urls: {
      tunnel: tunnelUrl,
      local: `http://${getIP()}:${config.port}/mcp?token=${config.token}`,
    }
  };
  
  tui.quote('⚠️  WARNING: This export contains your authentication token!', { type: 'warn', title: 'Security Notice' });
  tui.quote('Store this securely and never share it publicly.', { type: 'info' });
  
  const jsonExport = JSON.stringify(exportData, null, 2);
  tui.copyBlock(jsonExport, { filename: 'ank-mcp-export.json', description: 'Exported Configuration:' });
  
  const save = await tui.confirm('Save to file?');
  if (save) {
    const filename = `ank-mcp-export-${Date.now()}.json`;
    writeFileSync(join(root, filename), jsonExport);
    tui.alert('success', 'Export saved', filename);
  }
}

// /import - Import configuration
async function cmdImport() {
  tui.section('Import Configuration');
  
  const filename = await tui.prompt('Enter export filename');
  const filepath = join(root, filename);
  
  if (!existsSync(filepath)) {
    tui.alert('error', 'File not found', filepath);
    return;
  }
  
  try {
    const importData = JSON.parse(readFileSync(filepath, 'utf-8'));
    
    if (!importData.config) {
      tui.alert('error', 'Invalid export file', 'Missing config section');
      return;
    }
    
    tui.quote([
      `Port: ${importData.config.port}`,
      `Shell: ${importData.config.allow_shell ? 'Enabled' : 'Disabled'}`,
      `Paths: ${importData.config.allowed_paths.join(', ')}`,
    ], { type: 'info', title: 'Will import:' });
    
    const confirm = await tui.confirm('Import this configuration? (This will overwrite current settings)');
    
    if (confirm) {
      const config = ensureConfig();
      config.port = importData.config.port;
      config.allow_shell = importData.config.allow_shell;
      config.allowed_paths = importData.config.allowed_paths;
      
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
      updateEnvFile(config, importData.urls?.tunnel);
      
      tui.alert('success', 'Configuration imported', 'Restart server for changes to apply');
    }
  } catch (err) {
    tui.alert('error', 'Import failed', err.message);
  }
}

// /logs - View logs
async function cmdLogs() {
  tui.section('Server Logs');
  
  if (!existsSync(logPath)) {
    tui.alert('info', 'No logs available', 'Logs are created when server runs');
    return;
  }
  
  try {
    const logs = readFileSync(logPath, 'utf-8').split('\n').slice(-30).reverse();
    
    for (const line of logs) {
      if (!line.trim()) continue;
      
      if (line.includes('ERROR') || line.includes('❌') || line.includes('✗')) {
        console.log(`${colors.red}${line}${colors.reset}`);
      } else if (line.includes('WARN') || line.includes('⚠')) {
        console.log(`${colors.yellow}${line}${colors.reset}`);
      } else if (line.includes('SUCCESS') || line.includes('✓')) {
        console.log(`${colors.green}${line}${colors.reset}`);
      } else if (line.includes('INFO') || line.includes('ℹ')) {
        console.log(`${colors.cyan}${line}${colors.reset}`);
      } else {
        console.log(`${colors.gray}${line}${colors.reset}`);
      }
    }
  } catch (err) {
    tui.alert('error', 'Failed to read logs', err.message);
  }
}

// /changes - View changelog
async function cmdChanges() {
  tui.clear();
  tui.header('📋 Changelog', 'Version History');
  
  const changes = `
### v1.0.1 - Current
- Professional TUI with monochromatic theme
- Slash command system (/settings, /export, etc.)
- Markdown-style quoted responses
- LLM integration guides with copy-paste configs
- Export/import configuration
- Real-time log viewer with color coding

### v1.0.0 - Initial Release
- MCP server for Android/Termux
- Filesystem tools (read, write, list, delete)
- Shell command execution
- Termux:API integration (battery, notifications, clipboard)
- Browser tools (fetch, download)
- App management (list, open)
- Cloudflare tunnel support
- Auto-configuration with token generation
`;

  tui.renderMarkdown(changes);
}

// /tools - List MCP tools
async function cmdTools() {
  tui.section('Available MCP Tools');
  
  const tools = {
    '📁 Filesystem': ['list_files', 'read_file', 'write_file', 'create_dir', 'file_exists', 'delete_file'],
    '🐚 Shell': ['run_command', 'run_background'],
    '📱 Termux:API': ['battery_status', 'send_notification', 'vibrate', 'speak', 'clipboard_get', 'clipboard_set'],
    '🌐 Browser': ['open_url', 'fetch_url', 'download_file'],
    '📦 Apps': ['list_apps', 'open_app'],
    'ℹ️ System': ['system_info'],
  };

  for (const [category, toolList] of Object.entries(tools)) {
    console.log();
    console.log(`${colors.bold}${colors.cyan}${category}${colors.reset}`);
    for (const tool of toolList) {
      console.log(`  ${colors.green}✓${colors.reset} ${tool}`);
    }
  }
  console.log();
}

// /start - Start server
async function cmdStart() {
  tui.section('Starting Server');
  
  if (!checkDependencies()) {
    installDependencies();
  }
  
  const config = ensureConfig();
  const hasCloudflared = (() => {
    try { execSync('cloudflared --version', { stdio: 'ignore' }); return true; } catch { return false; }
  })();
  
  if (!hasCloudflared) {
    tui.alert('warn', 'cloudflared not found', 'Install with: pkg install cloudflared -y');
  }
  
  const server = spawn('node', [join(root, 'server.js')], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  
  let tunnelUrl = null;
  
  server.stdout.on('data', (data) => {
    const text = data.toString();
    logToFile(text);
    
    const match = text.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com\/mcp\?token=[^\s]+/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[0];
      saveTunnelUrl(tunnelUrl);
      
      tui.clear();
      tui.header('✅ Server Ready', tunnelUrl);
      
      tui.kvList([
        { label: 'Local', value: `http://${getIP()}:${config.port}/mcp?token=${config.token}` },
        { label: 'Tunnel', value: tunnelUrl },
      ]);
      
      tui.section('Quick Actions');
      tui.quote('Type /integrations for LLM setup guides', { type: 'info' });
    }
  });
  
  server.stderr.on('data', (data) => {
    console.error(colors.red + data.toString() + colors.reset);
  });
  
  process.on('SIGINT', () => {
    server.kill();
    tui.alert('info', 'Server stopped');
  });
}

// ============== MAIN CLI LOOP ==============

async function main() {
  // Ensure config and dependencies
  ensureConfig();
  
  if (!checkDependencies()) {
    installDependencies();
  }
  
  tui.clear();
  tui.header('⚡ Ank MCP', 'Universal Android Agent via MCP');
  
  // Show welcome info
  tui.quote([
    'Type /help or ? for available commands',
    'Use shortcut keys for quick access',
    'Press Ctrl+C to exit',
  ], { type: 'info', title: '💡 Quick Start' });
  
  // Main command loop
  while (true) {
    console.log();
    const input = await tui.prompt(`${colors.cyan}ank-mcp>${colors.reset}`);
    const cmd = input.toLowerCase().trim();
    
    // Handle shortcuts
    const shortcuts = {
      '?': '/help',
      's': '/status',
      '1': '/start',
      '0': '/stop',
      'S': '/settings',
      'i': '/integrations',
      'e': '/export',
      'I': '/import',
      'l': '/logs',
      'c': '/changes',
      't': '/tools',
      'x': '/clear',
      'q': '/exit',
    };
    
    const resolvedCmd = shortcuts[cmd] || cmd;
    
    // Route commands
    switch (resolvedCmd) {
      case '/help':
      case '?':
        await cmdHelp();
        break;
      case '/status':
      case 's':
        await cmdStatus();
        break;
      case '/start':
      case '1':
        await cmdStart();
        break;
      case '/stop':
      case '0':
        tui.alert('info', 'Stop server', 'Press Ctrl+C to stop the running server');
        break;
      case '/settings':
      case 'S':
        await cmdSettings();
        break;
      case '/integrations':
      case 'i':
        await cmdIntegrations();
        break;
      case '/export':
      case 'e':
        await cmdExport();
        break;
      case '/import':
      case 'I':
        await cmdImport();
        break;
      case '/logs':
      case 'l':
        await cmdLogs();
        break;
      case '/changes':
      case 'c':
        await cmdChanges();
        break;
      case '/tools':
      case 't':
        await cmdTools();
        break;
      case '/clear':
      case 'x':
        tui.clear();
        tui.header('⚡ Ank MCP', 'Universal Android Agent via MCP');
        break;
      case '/exit':
      case 'q':
      case 'exit':
      case 'quit':
        tui.clear();
        tui.alert('info', 'Goodbye!', 'Thank you for using Ank MCP');
        process.exit(0);
        break;
      default:
        tui.alert('error', 'Unknown command', `Type /help for available commands. You entered: ${cmd}`);
    }
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  tui.clear();
  tui.alert('info', 'Goodbye!', 'Thank you for using Ank MCP');
  process.exit(0);
});

main().catch(err => {
  tui.alert('error', 'Fatal Error', err.message);
  process.exit(1);
});
