/**
 * Ank MCP - Professional TUI Library
 * Monochromatic theme with alert colors
 * Supports markdown-style formatting and quoted messages
 */

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Grayscale
  black: '\x1b[30m',
  gray: '\x1b[90m',
  brightGray: '\x1b[37m',
  white: '\x1b[37m',
  
  // Alert colors
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  green: '\x1b[32m',
  brightGreen: '\x1b[92m',
  yellow: '\x1b[33m',
  brightYellow: '\x1b[93m',
  blue: '\x1b[34m',
  brightBlue: '\x1b[94m',
  cyan: '\x1b[36m',
  brightCyan: '\x1b[96m',
  magenta: '\x1b[35m',
  brightMagenta: '\x1b[95m',
  
  // Background
  bgBlack: '\x1b[40m',
  bgGray: '\x1b[100m',
  bgBlue: '\x1b[44m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Log levels
const LogLevel = { DEBUG: 0, INFO: 1, SUCCESS: 2, WARN: 3, ERROR: 4 };

class Logger {
  constructor(options = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.showTimestamp = options.showTimestamp ?? true;
  }

  _timestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  _format(level, color, message, data) {
    const ts = this.showTimestamp ? `${colors.gray}[${this._timestamp()}]${colors.reset} ` : '';
    const icon = {
      [LogLevel.DEBUG]: '·',
      [LogLevel.INFO]: 'ℹ',
      [LogLevel.SUCCESS]: '✓',
      [LogLevel.WARN]: '⚠',
      [LogLevel.ERROR]: '✗',
    }[level];
    return `${ts}${color}${icon}${colors.reset} ${message}`;
  }

  debug(msg, data) { if (this.level <= LogLevel.DEBUG) console.log(this._format(LogLevel.DEBUG, colors.gray, msg, data)); }
  info(msg, data) { if (this.level <= LogLevel.INFO) console.log(this._format(LogLevel.INFO, colors.brightCyan, msg, data)); }
  success(msg, data) { if (this.level <= LogLevel.SUCCESS) console.log(this._format(LogLevel.SUCCESS, colors.brightGreen, msg, data)); }
  warn(msg, data) { if (this.level <= LogLevel.WARN) console.log(this._format(LogLevel.WARN, colors.brightYellow, msg, data)); }
  error(msg, data) { if (this.level <= LogLevel.ERROR) console.log(this._format(LogLevel.ERROR, colors.brightRed, msg, data)); }
}

class TUI {
  constructor() {
    this.logger = new Logger();
    this.width = process.stdout.columns || 80;
    process.stdout.on('resize', () => { this.width = process.stdout.columns || 80; });
  }

  clear() { console.clear(); }

  line(char = '─', color = colors.gray) {
    console.log(color + char.repeat(this.width) + colors.reset);
  }

  header(title, subtitle = '') {
    const padding = Math.floor((this.width - title.length) / 2);
    console.log();
    this.line('═', colors.brightCyan);
    console.log(`${colors.bold}${colors.brightCyan}${' '.repeat(Math.max(0, padding))}${title}${colors.reset}`);
    if (subtitle) console.log(`${colors.gray}${' '.repeat(padding)}${subtitle}${colors.reset}`);
    this.line('═', colors.brightCyan);
    console.log();
  }

  section(title, icon = '▸') {
    console.log();
    console.log(`${colors.bold}${colors.brightWhite}${icon} ${title}${colors.reset}`);
    this.line('─');
  }

  // Quoted message block (like chat/MD responses)
  quote(content, options = {}) {
    const { type = 'default', title = '' } = options;
    const config = {
      default: { color: colors.gray, icon: '│' },
      info: { color: colors.brightCyan, icon: 'ℹ' },
      success: { color: colors.brightGreen, icon: '✓' },
      warn: { color: colors.brightYellow, icon: '⚠' },
      error: { color: colors.brightRed, icon: '✗' },
      code: { color: colors.brightMagenta, icon: '»' },
    }[type] || config.default;

    const lines = Array.isArray(content) ? content : content.split('\n');
    console.log();
    if (title) console.log(`${config.color}${config.icon} ${title}${colors.reset}`);
    for (const line of lines) {
      console.log(`${config.color}│ ${line}${colors.reset}`);
    }
    console.log(`${config.color}└${'─'.repeat(this.width - 2)}${colors.reset}`);
    console.log();
  }

  // Code block with syntax highlighting simulation
  codeBlock(code, options = {}) {
    const { lang = '', title = '' } = options;
    const lines = code.split('\n');
    const maxWidth = Math.max(...lines.map(l => l.length), 40);
    
    console.log();
    if (title) console.log(`${colors.gray}${title}${colors.reset}`);
    console.log(`${colors.gray}┌${'─'.repeat(Math.min(maxWidth + 2, this.width - 4))}┐${colors.reset}`);
    if (lang) {
      console.log(`${colors.gray}│${colors.brightMagenta} ${lang} ${colors.gray}${' '.repeat(Math.min(maxWidth, this.width - 8))}│${colors.reset}`);
      console.log(`${colors.gray}├${'─'.repeat(Math.min(maxWidth + 2, this.width - 4))}┤${colors.reset}`);
    }
    for (const line of lines) {
      const truncated = line.length > this.width - 6 ? line.slice(0, this.width - 6) + '...' : line;
      console.log(`${colors.gray}│${colors.reset} ${colors.brightGray}${truncated}${colors.reset}${colors.gray}${' '.repeat(Math.max(0, this.width - truncated.length - 6))}│${colors.reset}`);
    }
    console.log(`${colors.gray}└${'─'.repeat(Math.min(maxWidth + 2, this.width - 4))}┘${colors.reset}`);
    console.log();
  }

  // Copy-ready config block
  copyBlock(content, options = {}) {
    const { filename = '', description = '' } = options;
    this.quote(content, { type: 'code', title: description || (filename ? `📋 ${filename}` : '') });
    console.log(`${colors.dim}   → Select and copy the text above${colors.reset}\n`);
  }

  box(content, options = {}) {
    const { title = '', color = colors.gray, padding = 1 } = options;
    const lines = Array.isArray(content) ? content : content.split('\n');
    const innerWidth = this.width - 4;
    
    const wrapped = [];
    for (const line of lines) {
      if (line.length <= innerWidth) {
        wrapped.push(line);
      } else {
        const words = line.split(' ');
        let current = '';
        for (const word of words) {
          if ((current + word).length <= innerWidth) {
            current += (current ? ' ' : '') + word;
          } else {
            if (current) wrapped.push(current);
            current = word;
          }
        }
        if (current) wrapped.push(current);
      }
    }

    const maxLen = Math.max(innerWidth, title.length);
    
    console.log(color + '┌' + '─'.repeat(maxLen + 2) + '┐' + colors.reset);
    if (title) {
      const titlePad = Math.floor((maxLen - title.length) / 2);
      console.log(`${color}│${' '.repeat(titlePad)}${colors.bold}${title}${colors.reset}${color}${' '.repeat(maxLen - titlePad - title.length)}│${colors.reset}`);
      console.log(color + '├' + '─'.repeat(maxLen + 2) + '┤' + colors.reset);
    }
    for (const line of wrapped) {
      console.log(`${color}│ ${line.padEnd(maxLen)} │${colors.reset}`);
    }
    console.log(color + '└' + '─'.repeat(maxLen + 2) + '┘' + colors.reset);
  }

  status(label, status, options = {}) {
    const icons = { running: '⋯', done: '✓', error: '✗', pending: '○' };
    const colors_map = { running: colors.yellow, done: colors.green, error: colors.red, pending: colors.gray };
    const icon = icons[status] || icons.pending;
    const color = colors_map[status] || colors.gray;
    console.log(`  ${color}${icon}${colors.reset} ${label}`);
  }

  progress(current, total, options = {}) {
    const { width = 30, label = '' } = options;
    const percent = Math.min(100, Math.round((current / total) * 100));
    const filled = Math.round((width * percent) / 100);
    const bar = `${colors.green}${'█'.repeat(filled)}${colors.reset}${colors.gray}${'░'.repeat(width - filled)}${colors.reset}`;
    process.stdout.write(`\r${label}${bar} ${percent}%`);
    if (current >= total) console.log();
  }

  spinner(message) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const start = () => {
      process.stdout.write(`\r${colors.cyan}${frames[i]}${colors.reset} ${message}`);
      i = (i + 1) % frames.length;
    };
    const interval = setInterval(start, 80);
    start();
    return {
      update: (msg) => { message = msg; },
      stop: (finalMsg = '') => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(this.width) + '\r');
        if (finalMsg) console.log(`${colors.green}✓${colors.reset} ${finalMsg}`);
      },
      fail: (errMsg) => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(this.width) + '\r');
        console.log(`${colors.red}✗${colors.reset} ${errMsg}`);
      },
    };
  }

  menu(items, options = {}) {
    const { header = '', footer = '' } = options;
    if (header) { console.log(`${colors.bold}${header}${colors.reset}\n`); }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = item.shortcut ? `[${item.shortcut}]` : `[${i + 1}]`;
      const desc = item.description ? colors.gray + ' — ' + item.description + colors.reset : '';
      console.log(`  ${colors.cyan}${key}${colors.reset} ${item.label}${desc}`);
    }
    if (footer) console.log('\n' + colors.gray + footer + colors.reset);
  }

  table(rows, columns) {
    const colWidths = columns.map((col, i) => 
      Math.min(40, Math.max(col.label.length, ...rows.map(row => String(row[i] ?? '').length)))
    );
    const header = columns.map((col, i) => col.label.padEnd(colWidths[i])).join('  ');
    console.log(`${colors.bold}${colors.brightWhite}${header}${colors.reset}`);
    this.line('─', colors.gray);
    for (const row of rows) {
      const line = columns.map((col, i) => {
        const val = row[i] ?? '';
        return (col.format ? col.format(val) : String(val)).padEnd(colWidths[i]);
      }).join('  ');
      console.log(line);
    }
  }

  kvList(items) {
    const maxKey = Math.max(...items.map(item => item.label.length));
    for (const item of items) {
      const value = item.value !== undefined ? item.value : item.default;
      const formatted = item.format ? item.format(value) : String(value);
      console.log(`  ${colors.gray}${item.label.padEnd(maxKey)}${colors.reset}  ${formatted}`);
    }
  }

  alert(type, title, message) {
    const config = {
      info: { color: colors.brightCyan, icon: 'ℹ' },
      success: { color: colors.brightGreen, icon: '✓' },
      warn: { color: colors.brightYellow, icon: '⚠' },
      error: { color: colors.brightRed, icon: '✗' },
    }[type] || { color: colors.white, icon: '•' };
    console.log();
    console.log(`${config.color}${config.icon} ${title}${colors.reset}`);
    if (message) console.log(`${colors.gray}${message}${colors.reset}`);
  }

  async prompt(question, options = {}) {
    const { default: defaultValue, type = 'string', validate } = options;
    const rl = await import('readline');
    const readline = rl.createInterface({ input: process.stdin, output: process.stdout });
    const defaultStr = defaultValue !== undefined ? ` [${defaultValue}]` : '';
    
    return new Promise((resolve) => {
      readline.question(`${colors.cyan}?${colors.reset} ${question}${defaultStr}: `, (answer) => {
        readline.close();
        const value = answer || defaultValue;
        if (validate && !validate(value)) {
          console.log(`${colors.red}✗ Invalid input${colors.reset}`);
          return this.prompt(question, options).then(resolve);
        }
        resolve(value);
      });
    });
  }

  async confirm(message, options = {}) {
    const { default: defaultValue = false } = options;
    const defaultStr = defaultValue ? '(Y/n)' : '(y/N)';
    const answer = await this.prompt(`${message} ${defaultStr}`);
    if (answer === undefined || answer === '') return defaultValue;
    return ['y', 'yes', 'true'].includes(answer.toLowerCase());
  }

  async select(message, options) {
    console.log(`${colors.cyan}?${colors.reset} ${message}\n`);
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      console.log(`  ${colors.gray}[${i + 1}]${colors.reset} ${opt.label || opt}`);
    }
    console.log();
    const answer = await this.prompt('Enter choice');
    return options[parseInt(answer) - 1] || options[0];
  }

  // Markdown-style rendering helper
  renderMarkdown(md) {
    const lines = md.split('\n');
    let inCodeBlock = false;
    let codeContent = [];
    let codeLang = '';

    for (const line of lines) {
      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.slice(3);
          codeContent = [];
        } else {
          inCodeBlock = false;
          this.codeBlock(codeContent.join('\n'), { lang: codeLang });
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        this.section(line.slice(4), '◈');
      } else if (line.startsWith('## ')) {
        this.section(line.slice(3), '◇');
      } else if (line.startsWith('# ')) {
        this.header(line.slice(2));
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        this.quote(line.slice(2), { type: 'info' });
      }
      // Bold list items
      else if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          console.log(`  ${colors.cyan}•${colors.reset} ${colors.bold}${match[1]}${colors.reset} ${colors.gray}${match[2]}${colors.reset}`);
        }
      }
      // Regular list
      else if (line.startsWith('- ')) {
        console.log(`  ${colors.cyan}•${colors.reset} ${line.slice(2)}`);
      }
      // Empty line
      else if (line.trim() === '') {
        // Skip
      }
      // Regular text
      else {
        console.log(line);
      }
    }
  }
}

export { TUI, Logger, LogLevel, colors };
export default new TUI();
