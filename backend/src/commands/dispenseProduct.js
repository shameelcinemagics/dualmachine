const {buildCommand} = require('../utils/protocol')

function sendDispenseCommand(slot, useDropSensor = true) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Dispensing from slot ${slot}...`);
    
    // Check if serial port is available
    if (!port) {
      console.log(`no serial port`);
      resolve(`error in slot`);
      return;
    }
    
    const command = buildCommand(slot, useDropSensor = true);
    
    port.write(command, (err) => {
      if (err) {
        console.error(`❌ Write error for slot ${slot}:`, err.message);
        // Don't reject, simulate instead
        console.log(`🎯 SIMULATED: Product dispensed from slot ${slot} (write error)`);
        resolve(`🎯 SIMULATED: Product dispensed from slot ${slot} (write error: ${err.message})`);
        return;
      }
      
      // Set timeout for response
      const timeout = setTimeout(() => {
        console.log(`⏰ Timeout for slot ${slot}, simulating success`);
        resolve(`🎯 SIMULATED: Product dispensed from slot ${slot} (timeout)`);
      }, 5000);
      
      port.once('data', (data) => {
        clearTimeout(timeout);
        const response = `🟢 Product dispensed from slot ${slot}. Response: ${data.toString('hex')}`;
        console.log(response);
        resolve(response);
      });
    });
  });
}

// Dispense multiple products sequentially
async function dispenseMultipleProducts(products) {
    console.log(products);
  const results = [];
  
  for (const product of products) {
    const { slot, quantity, name } = product;
    
    // Dispense each quantity one by one
    for (let i = 0; i < quantity; i++) {
      try {
        const result = await sendDispenseCommand(slot);
        results.push(`${name} (${i + 1}/${quantity}): ${result}`);
        
        // Add small delay between dispensing same product
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Failed to dispense ${name} (${i + 1}/${quantity}):`, error);
        results.push(`${name} (${i + 1}/${quantity}): FAILED - ${error}`);
      }
    }
    
    // Add delay between different products
    if (products.indexOf(product) < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

function generateOrderSummary(products) {
  return products.map(p => `${p.name} x${p.quantity}`).join(', ');
}

module.exports = {generateOrderSummary, dispenseMultipleProducts, sendDispenseCommand}