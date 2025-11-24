const axios = require('axios');
const Database = require('better-sqlite3');
const db = new Database('planogram.db'); // Make sure this file exists and has the correct schema

const API_URL = process.env.API_URL; // ✅ Your Supabase URL
const API_KEY = process.env.API_KEY; // ⚠️ Move to .env in production

async function syncSaleToCloud(sale) {
  try {
    // 1️⃣ Send sale record to Supabase 'sales' table
    const response = await axios.post(
      `${API_URL}/rest/v1/sales`,
      {
        vending_machine_id: sale.vending_machine_id,
        product_id: sale.product_id,
        slot_number: sale.slot_number,
        quantity: sale.quantity,
        sold_at: sale.sold_at,
        unit_price: sale.unit_price,
      },
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2️⃣ If sale saved successfully, call RPC to decrease quantity
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Synced sale for slot ${sale.slot_number} to cloud.`);

      // Call RPC to reduce quantity in slots table
      await axios.post(
        `${API_URL}/rest/v1/rpc/decrease_slot_quantity`,
        {
          vm_id: sale.vending_machine_id,
          slot: sale.slot_number, // ✅ must match your RPC parameter name
          qty: sale.quantity,
        },
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // 3️⃣ Mark the local sale as synced
      db.prepare(`UPDATE saleslog SET sync = 1 WHERE id = ?`).run(sale.id);
      console.log(`✅ Local sale ${sale.id} marked as synced.`);
    } else {
      console.warn(`⚠️ Unexpected response status: ${response.status}`);
    }
  } catch (err) {
    console.error(`❌ Failed to sync sale to cloud:`, err.message);
  }
}

module.exports = {
  syncSaleToCloud
};
