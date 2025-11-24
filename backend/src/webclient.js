const WebSocket = require('ws');
const { dispenseMultipleProducts } = require('../src/commands/sendCommand'); // Adjust if needed
const { sendDispenseCommand } = require('./commands/sendCommand');

const machineId = process.env.MACHINEID;
const serverUrl = 'wss://central-6vfl.onrender.com';
let ws;
let heartbeatInterval = null;

function connect() {
  ws = new WebSocket(serverUrl);

  ws.on('open', () => {
    console.log('✅ Connected to central server');
    ws.send(JSON.stringify({ type: 'register', machineId }));

    // Start heartbeat
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', machineId }));
      }
    }, 20000);
  });

  ws.on('message', (data) => {
    const text = data.toString().trim();
    try {
      const msg = JSON.parse(text);
      console.log('Received message:', msg);

      if (msg.type === 'pong') return;

      if (msg.type === 'dispense') {
        console.log(`🛠️ Dispense command received for slot ${msg.slotNumber}`);
        sendDispenseCommand(msg.slotNumber);
      }
    } catch (err) {
      console.warn('❌ Invalid message:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed. Retrying in 3 seconds...');
    retryConnection();
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    ws.close(); // Triggers 'close', which will retry
  });
}

function retryConnection() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  setTimeout(() => {
    console.log('🔁 Attempting to reconnect...');
    connect();
  }, 3000);
}

connect();

