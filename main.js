const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { SerialPort } = require("serialport");
const { buildCommand, parseResponse } = require("./utils/protocol");

// Initialize variables for backend process and serial port
let backendProcess;
let port;

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:8080");
  } else {
    win.loadFile(path.join(__dirname, "snack-byte-kiosk-ui", "dist", "index.html"));
  }
}

function initSerialPort() {
  // Initialize SerialPort
  port = new SerialPort({
    path: process.env.SERIAL_PORT || 'COM5', // Replace with your actual port name
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
  });

  port.on("open", () => {
    console.log("Serial port opened successfully!");
  });

  port.on("error", (err) => {
    console.error("Serial port error:", err);
  });
}

app.whenReady().then(() => {
  // Start backend silently (as you've done)
  backendProcess = spawn("node", ["backend/server.js"], {
    stdio: "ignore", // or "ignore" to hide logs
    shell: true,
  });

  // Initialize the serial port
  initSerialPort();

  // Create the window
  createWindow();
});

// Handle the serial port communication via IPC
ipcMain.handle("send-command-to-slot", async (event, { slotNumber, useDropSensor }) => {
  if (!port) {
    throw new Error("Serial port not initialized");
  }

  try {
    const command = useDropSensor ? 0xaa : 0x55;
    const packet = buildCommand(0x00, slotNumber, command);

    return new Promise((resolve, reject) => {
      let responseBuffer = Buffer.alloc(0);

      const onData = (data) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);

        if (responseBuffer.length >= 5) {
          port.removeListener("data", onData); // Stop listening

          try {
            const response = parseResponse(responseBuffer.slice(0, 5));
            resolve(response);
          } catch (err) {
            reject(new Error("Failed to parse response"));
          }
        }
      };

      port.on("data", onData);

      port.write(packet, (err) => {
        if (err) {
          reject(new Error(`Error writing to slot ${slotNumber}: ${err.message}`));
        }
      });

      // Timeout to avoid hanging forever
      setTimeout(() => {
        if (responseBuffer.length < 5) {
          port.removeListener("data", onData);
          reject(new Error(`Timeout waiting for response from slot ${slotNumber}`));
        }
      }, 5000); // Timeout after 5 seconds
    });
  } catch (err) {
    console.error(`Error sending command to slot ${slotNumber}:`, err.message);
    throw err;
  }
});

// Cleanup on window close
app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill(); // cleanup the backend
  if (port) {
    port.close(() => {
      console.log("Serial port closed.");
    });
  }
  if (process.platform !== "darwin") app.quit();
});
