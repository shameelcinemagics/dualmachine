Add-Type -AssemblyName System.Windows.Forms

# Launch the Mobile Hotspot settings page directly
Start-Process "ms-settings:network-mobilehotspot"

# Wait for the page to load fully
Start-Sleep -Seconds 3

# Send 13 TABs to focus the first toggle
for ($i = 1; $i -le 14; $i++) {
    [System.Windows.Forms.SendKeys]::SendWait("{TAB}")
    Start-Sleep -Milliseconds 200
}

# Press SPACE to toggle the Mobile Hotspot ON/OFF
[System.Windows.Forms.SendKeys]::SendWait(" ")

# Wait for the action to complete
Start-Sleep -Seconds 2

# Close the Settings window (Alt + F4)
[System.Windows.Forms.SendKeys]::SendWait("%{F4}")
