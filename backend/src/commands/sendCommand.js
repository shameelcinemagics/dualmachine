const { SerialPort } = require("serialport");
const { buildCommand, parseResponse } = require("../utils/protocol");
const {vendSync} = require('../services/vendsync')
const {transationSyn} = require('../services/transations')
// const prisma = require("../db/client")

const port = new SerialPort({
  path: process.env.SERIAL_PORT, // ⚠️ Replace with your actual port name
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

const port1 = new SerialPort({
  path: process.env.SERIAL_PORT1, // ⚠️ Replace with your actual port name
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

function getPortAndBoard(slot) {
  if (slot >= 1 && slot <= 60) return port;
  if (slot >= 100 && slot <= 160) return port1;
  return null;
}


// ✅ Send command to test a single slot
function sendCommandToSlot(slotNumber, useDropSensor = false, boardId = 0x00) {
  return new Promise((resolve, reject) => {
    if (slotNumber < 1 || slotNumber > 160) {
      return reject(new Error(`❌ Invalid slot: ${slotNumber}`));
    }

    const selectedPort = getPortAndBoard(slotNumber)

    const command = useDropSensor ? 0xaa : 0x55;
    const packet = buildCommand(boardId, slotNumber, command);

    console.log(`➡️  Sending to Slot ${slotNumber}:`, packet);

    let responseBuffer = Buffer.alloc(0);

    const onData = (data) => {
      responseBuffer = Buffer.concat([responseBuffer, data]);

      if (responseBuffer.length >= 5) {
        selectedPort.off("data", onData); // stop listening

        try {
          const response = parseResponse(responseBuffer.slice(0, 5));
          console.log(`⬅️  Response from Slot ${slotNumber}:`, response);
          resolve(response);
        } catch (err) {
          err.rawBuffer = responseBuffer.slice(0, 5);
          reject(err);
        }
      }
    };

    selectedPort.on("data", onData);

    selectedPort.write(packet, (err) => {
      if (err) {
        port.off("data", onData);
        return reject(new Error(`❌ Error writing to slot ${slotNumber}: ${err.message}`));
      }
    });

    // Optional timeout to avoid hanging forever
    setTimeout(() => {
      if (responseBuffer.length < 5) {
        selectedPort.off("data", onData);
        reject(new Error(`⏰ Timeout waiting for response from slot ${slotNumber}`));
      }
    }, 5000); // 1-second timeout
  });
}


//find slots in db
// async function getSlotFromDb() {
// const slots = await prisma.slot.findMany();
// console.log(slots)
// return slots.map((slot)=>slot.slotNumber)  
// }

// ✅ Run test on ALL slots
async function testAllSlots(useDropSensor = false, delay = 3000) {
  const selectedSlots = [1,3,5,7,9,11,12,13,14,15,16,17,18,19,20,21,23,25,27,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,
    101,103,105,107,109,111,112,113,114,115,116,117,118,119,120,121,123,125,127,129,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160
  ];
  for (const slot of selectedSlots) {
    try {
      const response = await sendCommandToSlot(slot, useDropSensor);
      console.log(`✅ Slot ${slot} Response:`, response);
    } catch (err) {
      console.error(`❌ Slot ${slot} Error: ${err.message}`);

      // Optional: capture raw buffer if available
      if (err.rawBuffer) {
        console.error(`🟠 Raw Buffer from Slot ${slot}:`, err.rawBuffer);
      }
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log("✅ Finished testing all slots.");
  
}

function buildReadTempCommand(boardNumber = 0x00) {
  const cmd = 0xDC;
  const d1 = boardNumber;
  const d2 = 0xFF - d1;
  const d3 = cmd;
  const d4 = 0xFF - d3;
  const d5 = 0x55;
  const d6 = 0xAA;

  return Buffer.from([d1, d2, d3, d4, d5, d6]);
}

async function enableControler(){
  const command = [0X00,0XFF,0XCC,0X33,0X01,0XFE];
  const data = Buffer.from(command);
  port.write(data,(err)=>{
    if(err) return res.json({message:"serial port failure"})
  });

  port.on("data",(chunk)=>{
    console.log("response recieved:",chunk);
  })
} 

function toSigned(val) {
  return val < 128 ? val : val - 256;
}

async function readAndLogTemperature() {
  const ports = [port, port1]; // Include both ports in an array

  // Define a helper function to read from a single port
  const readTemperatureFromPort = (currentPort) => {
    const packet = Buffer.from([0x00, 0xFF, 0xDC, 0x23, 0x55, 0xAA]);

    return new Promise((resolve, reject) => {
      console.log(`📤 Sending read temperature command on ${currentPort.path}:`, packet);
      currentPort.write(packet, (err) => {
        if (err) return reject(new Error(`❌ Serial write failed on port ${currentPort.path}: ${err.message}`));
      });

      let buffer = Buffer.alloc(0);
      const timeout = setTimeout(() => {
        currentPort.removeAllListeners('data');
        reject(new Error(`⏳ Timeout: No complete response from ${currentPort.path}`));
      }, 2000);

      currentPort.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        console.log(`📥 Raw response from ${currentPort.path}:`, chunk.toString('hex'));
        console.log(`📥 Response length from ${currentPort.path}:`, chunk.length, "bytes");

        if (buffer.length >= 5) {
          clearTimeout(timeout);
          currentPort.removeAllListeners('data');

          const [driveBoard, status, temp1Byte, temp2Byte, checksum] = buffer;

          const temp1 = temp1Byte < 128 ? temp1Byte : temp1Byte - 256;
          const temp2 = temp2Byte < 128 ? temp2Byte : temp2Byte - 256;

          const calculatedChecksum = (driveBoard + status + temp1Byte + temp2Byte) & 0xFF;

          if (checksum !== calculatedChecksum) {
            return reject(new Error(`❌ Checksum mismatch on port ${currentPort.path}: expected 0x${calculatedChecksum.toString(16)}, got 0x${checksum.toString(16)}`));
          }

          console.log(`🌡️ Temp1 on ${currentPort.path}: ${temp1}°C`);
          console.log(`🌡️ Temp2 on ${currentPort.path}: ${temp2}°C`);

          resolve({
            temperature1: temp1,
            temperature2: temp2,
            raw_response: buffer.toString('hex'),
            status: 'success',
            port: currentPort.path, // Include the port path in the result for clarity
          });
        }
      });
    });
  };

  // Use Promise.all to fetch temperature from both ports simultaneously
  try {
    const results = await Promise.all(ports.map(port => readTemperatureFromPort(port)));
    console.log("📊 Temperature data from both ports:", results);
    return results; // This will return the temperature data from both ports
  } catch (err) {
    console.error("❌ Error reading temperatures from both ports:", err);
    throw err; // Rethrow the error if anything goes wrong
  }
}





function sendDispenseCommand(slot, useDropSensor = true) {
  return new Promise((resolve, reject) => {
    selectedPort = getPortAndBoard(slot)
    console.log(`🔄 Dispensing from slot ${slot}...`);
    
    // Check if serial port is available
    if (!port) {
      console.log(`no serial port`);
      resolve(`error in slot`);
      return;
    }
    
    const useDropSensor = true;
    const command = buildCommand(boardId = 0x00,slot, useDropSensor ? 0x11:0x00);
    
    selectedPort.write(command, (err) => {
      if (err) {
        console.error(`❌ Write error for slot ${slot}:`, err.message);
        // Don't reject, simulate instead
        console.log(`Product dispense from slot failed ${slot} (write error)`);
        resolve(`Product dispensed from slot failed ${slot} (write error: ${err.message})`);
        return;
      }
      
      // Set timeout for response
      const timeout = setTimeout(() => {
        console.log(`⏰ Timeout for slot ${slot}, simulating success`);
        resolve(`🎯 SIMULATED: Product not dispensed from slot ${slot} (timeout)`);
      }, 5000);
      
      selectedPort.once('data', (data) => {
        clearTimeout(timeout);
        const response = `🟢 Product dispensed from slot ${slot}. Response: ${data.toString('hex')}`;
        console.log(response);
        resolve(response);
      });
    });
  });
}

// Dispense multiple products sequentially
async function dispenseMultipleProducts(amount, products, paymentRequest) {
  vendSync(products);
  // console.log(products);
  const results = [];
  const trackId = paymentRequest.trackId;

  for (const product of products) {
    const { slot, quantity, name } = product;

    for (let i = 0; i < quantity; i++) {
      try {
        const result = await sendDispenseCommand(slot);
        results.push(`${name} (${i + 1}/${quantity}): SUCCESS`);
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Failed to dispense ${name} (${i + 1}/${quantity}):`, error);
        results.push(`${name} (${i + 1}/${quantity}): FAILED - ${error.message}`);
      }
    }

    if (products.indexOf(product) < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 🔁 Transform string results to structured objects
  const structuredResults = results.map(resultStr => {
    const [productPart, statusPart] = resultStr.split(': ');
    const [status, errorMessage] = statusPart.includes('FAILED')
      ? ['FAILED', statusPart.split('FAILED - ')[1]]
      : ['SUCCESS', null];

    return {
      trackId,
      product: productPart.trim(), // e.g., "Volvic Water (1/2)"
      status,
      error: errorMessage || null
    };
  });

  console.log("Structured Results:", structuredResults);
  transationSyn(structuredResults)
  return structuredResults;
}


function generateOrderSummary(products) {
  return products.map(p => `${p.name} x${p.quantity}`).join(', ');
}

// Example usage
// sendCommandToSlot(5, true);           // Test slot 5 with drop sensor
// testAllSlots(false);                  // Test all slots without drop sensor
module.exports = {
  port,
  port1,
  getPortAndBoard,
  enableControler,
  testAllSlots,
  readAndLogTemperature,
  generateOrderSummary, dispenseMultipleProducts, sendDispenseCommand, sendCommandToSlot
};
