#!/usr/bin/env node
/**
 * Ank MCP - Setup & Auto-Configuration Script
 * Professional TUI interface
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import tui, { colors } from '../lib/tui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const configPath = join(root, 'config.json');
const envPath = join(root, '.env');

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

// Get allowed paths
function getAllowedPaths() {
  const paths = ['/data/data/com.termux/files/home'];
  try {
    execSync('test -d /sdcard && echo "exists"', { encoding: 'utf-8' });
    paths.push('/sdcard');
  } catch {}
  return paths;
}

// Check dependencies
function checkDependencies() {
  const spin = tui.spinner('Checking Node dependencies');
  try {
    execSync('npm list express @modelcontextprotocol/sdk zod', { 
      cwd: root, encoding: 'utf-8', stdio: 'ignore' 
    });
    spin.stop('Dependencies OK');
    return true;
  } catch {
    spin.stop('Installing dependencies...');
    execSync('npm install', { cwd: root, stdio: 'inherit' });
    tui.success('Dependencies installed');
    return true;
  }
}

// Check Termux:API
function checkTermuxAPI() {
  const spin = tui.spinner('Checking Termux:API');
  try {
    execSync('termux-battery-status', { encoding: 'utf-8', timeout: 2000, stdio: 'ignore' });
    spin.stop('Termux:API available');
    return true;
  } catch {
    spin.stop('Termux:API not available');
    tui.alert('warn', 'Termux:API not found', 'Install: pkg install termux-api -y');
    return false;
  }
}

// Check cloudflared
function checkCloudflared() {
  const spin = tui.spinner('Checking cloudflared');
  try {
    execSync('cloudflared --version', { encoding: 'utf-8', stdio: 'ignore' });
    spin.stop('cloudflared available');
    return true;
  } catch {
    spin.stop('cloudflared not found');
    tui.alert('warn', 'cloudflared not installed', 'Install: pkg install cloudflared -y');
    return false;
  }
}

// Create config
function createConfig(token, port, allowedPaths, allowShell) {
  const config = { token, port, allowed_paths: allowedPaths, allow_shell: allowShell };
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return config;
}

// Create .env
function createEnvFile(config, tunnelUrl) {
  const localIp = getIP();
  const localUrl = `http://${localIp}:${config.port}/mcp?token=${config.token}`;
  const mcpUrl = tunnelUrl || localUrl;
  
  const envContent = `# Ank MCP Environment Variables
# Auto-generated: ${new Date().toISOString()}

# Authentication
ANK_MCP_TOKEN=${config.token}
ANK_MCP_PORT=${config.port}

# URLs
ANK_MCP_LOCAL_URL=${localUrl}
ANK_MCP_TUNNEL_URL=${tunnelUrl || 'not_configured'}
ANK_MCP_URL=${mcpUrl}

# Permissions
ANK_MCP_ALLOWED_PATHS=${config.allowed_paths.join(',')}
ANK_MCP_ALLOW_SHELL=${config.allow_shell}

# Generated
ANK_MCP_GENERATED_AT=${new Date().toISOString()}
`;
  writeFileSync(envPath, envContent);
  return { localUrl, mcpUrl };
}

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
  tui.header('⚡ Ank MCP Setup', 'Configuration & Environment');
  
  // Run checks
  checkDependencies();
  const hasTermuxAPI = checkTermuxAPI();
  const hasCloudflared = checkCloudflared();
  
  // Load or create config
  let config, token;
  
  if (existsSync(configPath)) {
    tui.section('Existing Configuration');
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
    tui.kvList([
      { label: 'Token', value: config.token },
      { label: 'Port', value: config.port },
      { label: 'Shell', value: config.allow_shell ? 'Enabled' : 'Disabled' },
    ]);
    
    const regenerate = await tui.confirm('Regenerate token?');
    if (regenerate) {
      token = generateToken();
      tui.success('New token generated');
    } else {
      token = config.token;
    }
  }
  
  if (!token) {
    token = generateToken();
  }
  
  // Create config
  const port = config?.port || 3000;
  const allowedPaths = config?.allowed_paths || getAllowedPaths();
  const allowShell = config?.allow_shell ?? true;
  
  config = createConfig(token, port, allowedPaths, allowShell);
  tui.success('Configuration saved');
  
  // Create .env
  const urls = createEnvFile(config, null);
  tui.success('Environment file created');
  
  // Summary
  tui.section('Configuration Summary');
  
  tui.kvList([
    { label: 'Token', value: config.token },
    { label: 'Port', value: config.port },
    { label: 'Allowed Paths', value: config.allowed_paths.join(', ') },
    { label: 'Shell', value: config.allow_shell ? 'Enabled' : 'Disabled' },
    { label: 'Termux:API', value: hasTermuxAPI ? 'Available' : 'Not available' },
    { label: 'cloudflared', value: hasCloudflared ? 'Available' : 'Not available' },
    { label: 'Local URL', value: urls.localUrl },
  ]);
  
  if (hasCloudflared) {
    console.log();
    tui.alert('info', 'Tunnel', 'Will be created automatically on server start');
  }
  
  tui.line();
  tui.alert('success', 'Setup Complete!', 'Run "npm start" or "ank-mcp" to start the server');
  console.log();
}

main().catch(err => {
  tui.alert('error', 'Setup Failed', err.message);
  process.exit(1);
});
