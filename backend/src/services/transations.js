const axios = require('axios');
const Database = require('better-sqlite3');
const db = new Database('planogram.db'); // Make sure this file exists and has the correct schema

const API_URL = process.env.API_URL ; // ✅ Your Supabase URL
const API_KEY = process.env.API_KEY; // ⚠️ Move to .env in production
const machine = process.env.MACHINEID

// data = ["trackid"]
// results.push("trackid:" + trackid,"product:" + name (i + 1/quantity),"status:"+ "FAILED")

async function transationSyn(sales) {
    console.log(sales)
    for (const sale of sales){
  try {
    // 1️⃣ Send sale record to Supabase 'sales' table
    const response = await axios.post(
      `${API_URL}/rest/v1/transactions`,
      {
        transationId: sale.trackId,
        product: sale.product,
        status: sale.status,
        machine: machine
      },
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if(response.status == 200 || response.status == 201){
        console.log("transation uploaded successfully")
    } else{
        console.log("transaction not uplaoded")
    }
    // 2️⃣ If sale saved successfully, call RPC to decrease quantity
  } catch (err) {
    console.error(`❌ Failed to sync sale to cloud:`, err.message);
  }
}
}

module.exports = {
  transationSyn
};
