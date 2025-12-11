/**
 * Auto-start Setup Script for Windows 11
 * This script enables/disables the bot to start automatically when Windows boots
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the Windows Startup folder path
function getStartupFolder() {
  const startupPath = path.join(
    process.env.APPDATA || '',
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Startup'
  );
  return startupPath;
}

// Create a VBS script to run the batch file without showing cmd window initially
// But the batch file itself will show the console for logs
function createVbsLauncher(batFilePath, vbsFilePath) {
  // Window style: 1 = Show window in normal state (visible console window)
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "${batFilePath.replace(/\\/g, '\\\\')}" & Chr(34), 1
Set WshShell = Nothing`;
  
  fs.writeFileSync(vbsFilePath, vbsContent, 'utf8');
  console.log(`✓ Created VBS launcher: ${vbsFilePath}`);
}

// Enable auto-start
function enableAutoStart() {
  try {
    // Check if running on Windows
    if (process.platform !== 'win32') {
      console.error('❌ This script only works on Windows');
      process.exit(1);
    }

    const startupFolder = getStartupFolder();
    
    // Check if startup folder exists
    if (!fs.existsSync(startupFolder)) {
      console.error(`❌ Startup folder not found: ${startupFolder}`);
      process.exit(1);
    }

    // Get the absolute path to the batch file
    const projectRoot = path.resolve(__dirname, '..');
    const batFilePath = path.join(projectRoot, 'start-bot.bat');
    
    // Check if batch file exists
    if (!fs.existsSync(batFilePath)) {
      console.error(`❌ start-bot.bat not found at: ${batFilePath}`);
      process.exit(1);
    }

    // Create VBS launcher in the project directory
    const vbsFilePath = path.join(projectRoot, 'launch-bot.vbs');
    createVbsLauncher(batFilePath, vbsFilePath);

    // Create shortcut to the VBS file in the Startup folder
    const shortcutName = 'LiveChatCaCaBox.lnk';
    const shortcutPath = path.join(startupFolder, shortcutName);
    
    // Remove existing shortcut if it exists
    if (fs.existsSync(shortcutPath)) {
      fs.unlinkSync(shortcutPath);
      console.log('✓ Removed existing shortcut');
    }

    // Create a PowerShell script to create the shortcut
    const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
$Shortcut.TargetPath = "${vbsFilePath.replace(/\\/g, '\\\\')}"
$Shortcut.WorkingDirectory = "${projectRoot.replace(/\\/g, '\\\\')}"
$Shortcut.Description = "LiveChat CaCaBox Bot Auto-Start"
$Shortcut.Save()
`;

    // Execute PowerShell script
    const psScriptPath = path.join(projectRoot, 'create-shortcut.ps1');
    fs.writeFileSync(psScriptPath, psScript, 'utf8');
    
    try {
      // Use RemoteSigned to allow locally created scripts while maintaining security
      execSync(`powershell -ExecutionPolicy RemoteSigned -File "${psScriptPath}"`, {
        stdio: 'inherit'
      });
      fs.unlinkSync(psScriptPath); // Clean up the PowerShell script
      
      console.log('\n✅ Auto-start enabled successfully!');
      console.log(`   Shortcut created in: ${startupFolder}`);
      console.log('   The bot will start automatically when Windows boots.');
      console.log('   A console window will appear showing the bot logs.\n');
    } catch (error) {
      fs.unlinkSync(psScriptPath); // Clean up even on error
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Failed to enable auto-start:', error.message);
    process.exit(1);
  }
}

// Disable auto-start
function disableAutoStart() {
  try {
    // Check if running on Windows
    if (process.platform !== 'win32') {
      console.error('❌ This script only works on Windows');
      process.exit(1);
    }

    const startupFolder = getStartupFolder();
    const shortcutPath = path.join(startupFolder, 'LiveChatCaCaBox.lnk');
    const projectRoot = path.resolve(__dirname, '..');
    const vbsFilePath = path.join(projectRoot, 'launch-bot.vbs');

    let removed = false;

    // Remove shortcut from Startup folder
    if (fs.existsSync(shortcutPath)) {
      fs.unlinkSync(shortcutPath);
      console.log('✓ Removed shortcut from Startup folder');
      removed = true;
    }

    // Remove VBS launcher
    if (fs.existsSync(vbsFilePath)) {
      fs.unlinkSync(vbsFilePath);
      console.log('✓ Removed VBS launcher');
      removed = true;
    }

    if (removed) {
      console.log('\n✅ Auto-start disabled successfully!\n');
    } else {
      console.log('\n⚠️  Auto-start was not enabled.\n');
    }

  } catch (error) {
    console.error('❌ Failed to disable auto-start:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

console.log('\n========================================');
console.log('  LiveChat CaCaBox Auto-Start Setup');
console.log('========================================\n');

if (command === 'enable') {
  enableAutoStart();
} else if (command === 'disable') {
  disableAutoStart();
} else {
  console.log('Usage:');
  console.log('  node scripts/setup-autostart.js enable   - Enable auto-start');
  console.log('  node scripts/setup-autostart.js disable  - Disable auto-start');
  console.log('\nOr use the npm scripts:');
  console.log('  npm run autostart:enable');
  console.log('  npm run autostart:disable\n');
  process.exit(1);
}
