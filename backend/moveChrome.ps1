Start-Sleep -Seconds 8

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WinAPI {
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool MoveWindow(IntPtr hWnd, int x, int y, int width, int height, bool repaint);
}
"@

Add-Type -AssemblyName System.Windows.Forms

# Get all screens
$screens = [System.Windows.Forms.Screen]::AllScreens

if ($screens.Count -lt 2) {
    Write-Output "❌ Less than two monitors detected."
    exit
}

# Assuming second screen is the "left" screen (index 1)
$secondScreen = $screens[1]

$x = $secondScreen.Bounds.X
$y = $secondScreen.Bounds.Y
$width = $secondScreen.Bounds.Width
$height = $secondScreen.Bounds.Height

# Get all Chrome processes with valid window handles
$chromeWindows = Get-Process chrome | Where-Object { $_.MainWindowHandle -ne 0 }

if ($chromeWindows.Count -eq 0) {
    Write-Output "❌ No Chrome windows found."
    exit
}

foreach ($chrome in $chromeWindows) {
    $hwnd = $chrome.MainWindowHandle
    if ($hwnd -ne 0) {
        try {
            # Restore window if minimized
            [WinAPI]::ShowWindow($hwnd, 9)  # 9 = SW_RESTORE

            # Move and resize the window to the second screen's bounds
            $result = [WinAPI]::MoveWindow($hwnd, $x, $y, $width, $height, $true)

            if ($result) {
                Write-Output "✅ Chrome window restored and moved to second screen."
            } else {
                Write-Output "❌ Failed to move Chrome window."
            }
        } catch {
            Write-Output "❌ Error: $_"
        }
    }
}
