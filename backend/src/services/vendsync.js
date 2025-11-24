// const db = require('better-sqlite3')('planogram.db');
// const Database = require('better-sqlite3');
// const db = new Database('planogram.db');
// const {saveSales} = require('../db/client')


const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid'); // Make sure this is at the top of your file
const {syncSaleToCloud} = require('./cloudSync')

function vendSync(data = []) {
    const db = Database('planogram.db')
    const saleinsert = db.prepare(`
  INSERT INTO saleslog (
    id, vending_machine_id, slot_number, product_id, quantity,
    sold_at, unit_price,sync,status
  ) VALUES (
    @id, @vending_machine_id, @slot_number, @product_id, @quantity,
    @sold_at, @unit_price, @sync, @status
  );
`);
  const tx = db.transaction((sales) => {
    for (const item of sales) {
      // Look up matching planogram slot
      const planogramEntry = db.prepare(`
        SELECT vending_machine_id, product_id, product_price
        FROM planogram
        WHERE slot_number = ?
      `).get(item.slot);
      console.log(planogramEntry);

      if (!planogramEntry) {
        console.warn(`No matching planogram entry for slot ${item.slot}. Skipping.`);
        continue;
      }

        const payload = {
        id: uuidv4(),
        vending_machine_id: planogramEntry.vending_machine_id,
        slot_number: item.slot,
        product_id: planogramEntry.product_id,
        quantity: item.quantity,
        sold_at: new Date().toISOString(),
        unit_price: item.price,
        sync: 0,
        status:item.status
      };
      console.log(payload)
      saleinsert.run(payload);

      db.prepare(`
        UPDATE planogram
        SET quantity = quantity - ?
        WHERE slot_number = ?
      `).run(payload.quantity, payload.slot_number);

      syncSaleToCloud(payload);

    }
  });

  tx(data);
  console.log('✅ vendSync: Sales inserted into saleslog.');
}

module.exports = {
    vendSync
}