const { execSync, exec } = require("child_process");
const path = require("path");

let signageRunning = false;

const signageUrl = "http://localhost:8080/signage.html";
const chromeDataDir = path.join("C:", "Temp", "SignageProfile"); // dedicated profile folder

/**
 * Get all displays using PowerShell
 * Returns an array of screens: {X, Y, Width, Height, Primary}
 */

function execHidden(cmd){
  return execSync(cmd,{
    encoding : "utf8",
    windowsHide : true,
    stdio: "pipe",
  })
}

function getDisplays() {
  try {
    const psCommand = `"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Windows.Forms; $screens=[System.Windows.Forms.Screen]::AllScreens; $arr=@(); foreach($s in $screens){$arr+=[PSCustomObject]@{X=$s.Bounds.X;Y=$s.Bounds.Y;Width=$s.Bounds.Width;Height=$s.Bounds.Height;Primary=$s.Primary}}; $arr | ConvertTo-Json -Compress"`;

    const output = execHidden(psCommand).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.error("⚠️ Failed to detect displays:", err.message);
    return [];
  }
}

/**
 * Launch Chrome signage on a given display
 */
function launchSignage(screen) {
  const command = `start chrome --kiosk --app=${signageUrl} --window-position=${screen.X},${screen.Y} --window-size=${screen.Width},${screen.Height} --user-data-dir="${chromeDataDir}" --no-first-run --no-default-browser-check`;
  console.log(`🟢 Launching signage: ${command}`);
  exec(command, { detached: true });
  signageRunning = true;
}

/**
 * Close Chrome signage safely
 */
function closeSignage() {
  if (!signageRunning) return;
  console.log("🔴 Closing signage...");

  try {
    const escapedPath = chromeDataDir.replace(/\\/g, '\\\\'); // escape backslashes
    const psCommand = `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${escapedPath}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`;
    execSync(psCommand, { stdio: "ignore" });
    console.log("🟢 Signage Chrome closed successfully.");
  } catch (err) {
    console.error("⚠️ Failed to kill signage Chrome:", err.message);
  }

  signageRunning = false;
}


/**
 * Watcher function to detect displays and launch/close signage
 */
function checkDisplays() {
  const displays = getDisplays();
//   console.log(`🖥️ Detected displays: ${displays.length}`);

  // Pick the first non-primary display as second screen
  const secondScreen = displays.find(s => !s.Primary);

  if (secondScreen && !signageRunning) {
    launchSignage(secondScreen);
  } else if (!secondScreen && signageRunning) {
    closeSignage();
  }
}

// Ensure the dedicated Chrome profile folder exists
const fs = require("fs");
if (!fs.existsSync(chromeDataDir)) fs.mkdirSync(chromeDataDir, { recursive: true });

// Start watcher
// console.log("👀 Watching for display changes every 10 seconds...");
setInterval(checkDisplays, 10000);
checkDisplays();
