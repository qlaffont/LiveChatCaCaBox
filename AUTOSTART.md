# Auto-Start Configuration for Windows 11

This guide explains how to configure LiveChat CaCaBox to automatically start when your Windows 11 PC boots up.

## Overview

The auto-start feature allows the bot to:
- Start automatically when Windows boots
- Display a console window with live logs
- Run in the background without manual intervention

## Prerequisites

Before enabling auto-start, ensure:
1. **Node.js** is installed (version 20 or higher)
2. **pnpm** is installed globally (`npm install -g pnpm`)
3. **FFmpeg** is installed and available in your system PATH
4. The bot is properly configured with a `.env` file
5. Dependencies are installed (`pnpm install`)

## Enable Auto-Start

To enable the bot to start automatically on Windows boot:

### Using npm/pnpm scripts:
```bash
pnpm autostart:enable
```

Or:
```bash
npm run autostart:enable
```

### Using Node.js directly:
```bash
node scripts/setup-autostart.js enable
```

### What happens when you enable auto-start:

1. A VBS launcher file (`launch-bot.vbs`) is created in the project directory
2. A shortcut is created in your Windows Startup folder:
   - Location: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\`
3. When Windows boots, the bot will start automatically
4. A console window will appear showing the bot logs in real-time

## Disable Auto-Start

To disable auto-start:

### Using npm/pnpm scripts:
```bash
pnpm autostart:disable
```

Or:
```bash
npm run autostart:disable
```

### Using Node.js directly:
```bash
node scripts/setup-autostart.js disable
```

This will remove:
- The shortcut from the Windows Startup folder
- The VBS launcher file from the project directory

## Manual Start

If you prefer to start the bot manually (without auto-start), you can:

### Option 1: Double-click the batch file
Simply double-click `start-bot.bat` in the project root directory.

### Option 2: Use npm/pnpm scripts
```bash
pnpm dev
```

## Viewing Logs

When the bot is running (either through auto-start or manual start):
- A console window will be visible showing real-time logs
- Logs include Discord events, server status, errors, and other activity
- Press `Ctrl+C` in the console window to stop the bot
- The console window will remain open if the bot crashes, allowing you to see error messages

## Troubleshooting

### Auto-start is not working

1. **Check if the shortcut exists:**
   - Open `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\`
   - Look for `LiveChatCaCaBox.lnk`

2. **Verify Node.js and pnpm are in PATH:**
   - Open Command Prompt and run: `node --version` and `pnpm --version`
   - If these commands fail, add Node.js to your system PATH

3. **Check the .env file:**
   - Ensure `.env` exists in the project root
   - Verify all required variables are set (DISCORD_TOKEN, DISCORD_CLIENT_ID, etc.)

4. **Check Windows Event Viewer:**
   - Look for application errors related to the bot startup

### Console window closes immediately

This usually means there's an error during startup. Check:
- `.env` file configuration
- Node.js and pnpm installation
- Dependencies installed with `pnpm install`

### Bot crashes on startup

The console window will stay open showing the error. Common issues:
- Invalid Discord token or client ID
- Missing dependencies
- FFmpeg not installed
- Database migration issues

## Advanced Configuration

### Customizing the startup behavior

You can modify `start-bot.bat` to:
- Change the window title
- Add pre-startup checks
- Configure logging options
- Set custom environment variables

### Running as a Windows Service

For advanced users who want the bot to run as a true Windows service (no console window), consider using:
- [node-windows](https://www.npmjs.com/package/node-windows)
- [pm2-windows-service](https://www.npmjs.com/package/pm2-windows-service)

## Notes

- The auto-start feature is **Windows-only**
- Moving the project folder after enabling auto-start will break the shortcut (disable and re-enable)
- The bot will start with the same user account that configured auto-start
- The console window can be minimized but will remain visible in the taskbar
- Closing the console window will stop the bot
