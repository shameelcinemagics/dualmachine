// posClient.js
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Terminal Configuration
const POS_IP = process.env.POS_IP;
const POS_PORT = 8083;
const CA_CERT = path.join(__dirname, 'ca.pem');

// Helper to connect and send request
function connectToPOS(requestObj) {
  return new Promise((resolve, reject) => {
    const options = {
      host: POS_IP,
      port: POS_PORT,
      ca: fs.readFileSync(CA_CERT),
      rejectUnauthorized: true
    };

    const client = tls.connect(options, () => {
      const message = JSON.stringify(requestObj) + String.fromCharCode(0x03);
      client.write(message);
    });

    client.on('data', (data) => {``
        
      const responseStr = data.toString().replace(/\x03/g, '');

      try {
        const response = JSON.parse(responseStr);
        resolve(response);
      } catch (err) {
        reject(new Error('Failed to parse response: ' + err.message));
      } finally {
        client.end();
      }
    });

    client.on('error', (err) => reject(err));
    client.on('end', () => console.log('🔒 Connection closed'));
  });
}

module.exports = { connectToPOS };
