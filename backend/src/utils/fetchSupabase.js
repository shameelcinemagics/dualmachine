const axios = require('axios');
const { savePlanogram, saveAssignedMedia } = require('../db/client');

const API_URL = process.env.API_URL; // replace
const API_KEY = process.env.API_KEY; // replace
const MACHINE_ID = process.env.MACHINEID;

async function fetchPlanogram() {
  try {
    const machineRes = await axios.get(`${API_URL}/rest/v1/vending_machines?machine_id=eq.${MACHINE_ID}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY
      }
    });

    const machine = machineRes.data[0];
    if (!machine) throw new Error('Machine not found');

    const slotRes = await axios.get(`${API_URL}/rest/v1/slots?vending_machine_id=eq.${machine.id}&select=*,product:product_id(id,name,price,image_url,category,calories,fat,carbs,protein,sodium,ingredients,health_rating)`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY
      }
    });

    const slots = slotRes.data;
    savePlanogram(slots);
    console.log(`✅ Synced ${slots.length} slots to SQLite`);
  } catch (err) {
    console.error('❌ Failed to fetch planogram:', err.message);
  }
}

async function fetchSignage() {
  try {
    const machineRes = await axios.get(`${API_URL}/rest/v1/vending_machines?machine_id=eq.${MACHINE_ID}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY
      }
    });

    const machine = machineRes.data[0];
    if (!machine) throw new Error('Machine not found');

    const Signage = await axios.get(`${API_URL}/rest/v1/machine_media?vending_machine_id=eq.${machine.id}&select=*,media:media(id,title,type,url)`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY
      }
    });

    console.log("data are",Signage.data)

    const signage = Signage.data;
    saveAssignedMedia(signage);
    console.log(`✅ Media Synced to db`);
  } catch (err) {
    console.error('❌ Failed to fetch media:', err.message);
  }
}

module.exports = { fetchPlanogram,fetchSignage };
