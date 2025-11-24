const { exec } = require("child_process");

setTimeout(() => {
  exec(
  `"C:/Program Files/Google/Chrome/Application/chrome.exe" --new-window --kiosk --disable-pinch --disable-gesture-requirements-for-pinch --disable-features=OverscrollHistoryNavigation http://localhost:8080`,
  { windowsHide: true, detached: true }
);
}, 5000);
