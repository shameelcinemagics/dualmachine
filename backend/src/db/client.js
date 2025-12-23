// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// module.exports = prisma;
const Database = require('better-sqlite3');
const db = new Database('planogram.db');

// Table for cached planogram
db.exec(`
  CREATE TABLE IF NOT EXISTS planogram (
    id TEXT PRIMARY KEY,
    vending_machine_id TEXT,
    slot_number INTEGER,
    product_id TEXT,
    quantity INTEGER,
    max_capacity INTEGER,
    product_name TEXT,
    product_price REAL,
    image_url TEXT,
    category TEXT,
    calories INTEGER,
    fat TEXT,
    carbs TEXT,
    protein TEXT,
    sodium TEXT,
    ingredients TEXT,
    health_rating INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS saleslog (
    id TEXT PRIMARY KEY,
    vending_machine_id TEXT,
    slot_number INTEGER,
    product_id TEXT,
    quantity INTEGER,
    sold_at TEXT, -- ISO timestamp
    unit_price REAL,
    status TEXT,
    sync INTEGER -- 0 = not synced, 1 = synced
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS assigned_media (
    media_id INTEGER PRIMARY KEY,
    vending_machine_id TEXT,
    url TEXT,
    type TEXT,
    title TEXT,
    created_at TEXT
  );
`);

const saleinsert = db.prepare(`
  INSERT INTO saleslog (
    id, vending_machine_id, slot_number, product_id, quantity,
    sold_at, unit_price,status,sync
  ) VALUES (
    @id, @vending_machine_id, @slot_number, @product_id, @quantity,
    @sold_at, @product_price,@status, @sync
  );
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO planogram (
    id, vending_machine_id, slot_number, product_id, quantity, max_capacity,
    product_name, product_price, image_url, category,
    calories, fat, carbs, protein, sodium, ingredients, health_rating
  ) VALUES (
    @id, @vending_machine_id, @slot_number, @product_id, @quantity, @max_capacity,
    @product_name, @product_price, @image_url, @category,
    @calories, @fat, @carbs, @protein, @sodium, @ingredients, @health_rating
  );
`);

const update = db.prepare(`
  UPDATE planogram SET
    vending_machine_id = @vending_machine_id,
    slot_number = @slot_number,
    product_id = @product_id,
    quantity = @quantity,
    max_capacity = @max_capacity,
    product_name = @product_name,
    product_price = @product_price,
    image_url = @image_url,
    category = @category,
    calories = @calories,
    fat = @fat,
    carbs = @carbs,
    protein = @protein,
    sodium = @sodium,
    ingredients = @ingredients,
    health_rating = @health_rating
  WHERE id = @id
`);

const check = db.prepare(`SELECT id FROM planogram WHERE id = ?`);

function saveSales(products = []){
  const tx = db.transaction((products)=>{
    for (const product of products){
      saleinsert.run({
        vending_machine_id: product.vending_machine_id,
        slot_number: product.slot_number,
        product_id: product.product_id,
        quantity: product.quantity,
        sold_at: product.sold_at,
        product_price: product.product?.price,
        sync:'false'
      })
    }
  })
}

function savePlanogram(slots = []) {
  const tx = db.transaction((slots) => {
    for (const slot of slots) {
      const exists = check.get(slot.id);

      const params = {
        id: slot.id,
        vending_machine_id: slot.vending_machine_id,
        slot_number: slot.slot_number,
        product_id: slot.product_id,
        quantity: slot.quantity,
        max_capacity: slot.max_capacity,
        product_name: slot.product?.name,
        product_price: slot.product?.price,
        image_url: slot.product?.image_url,
        category: slot.product?.category,
        calories: slot.product?.calories,
        fat: slot.product?.fat,
        carbs: slot.product?.carbs,
        protein: slot.product?.protein,
        sodium: slot.product?.sodium,
        ingredients: slot.product?.ingredients,
        health_rating: slot.product?.health_rating
      };

      if (exists) {
        update.run(params);
      } else {
        insert.run(params);
      }
    }
  });

  tx(slots);
}

function getPlanogram() {
  return db.prepare(`
    SELECT
      slot_number as slot,
      id,
      product_name as name,
      product_price as price,
      image_url as image,
      category,
      calories,
      fat,
      carbs,
      protein,
      sodium,
      ingredients,
      health_rating as healthRating,
      quantity as stockQuantity
    FROM planogram
    ORDER BY slot_number
  `).all();
}

function saveAssignedMedia(data = []) {
  const insertOrReplace = db.prepare(`
    INSERT OR REPLACE INTO assigned_media (
      media_id, vending_machine_id, url, type, title, created_at
    ) VALUES (
      @media_id, @vending_machine_id, @url, @type, @title, @created_at
    );
  `);

  const getExistingIds = db.prepare(`SELECT media_id FROM assigned_media`);
  const deleteStmt = db.prepare(`DELETE FROM assigned_media WHERE media_id = ?`);

  const tx = db.transaction((mediaArray) => {
    const newMediaIds = mediaArray.map(item => item.media.id);

    // Insert or update current media
    for (const item of mediaArray) {
      const media = item.media;

      insertOrReplace.run({
        media_id: media.id,
        vending_machine_id: item.vending_machine_id,
        url: media.url,
        type: media.type,
        title: media.title,
        created_at: item.created_at
      });
    }

    // Delete old/unassigned media
    const existing = getExistingIds.all().map(row => row.media_id);
    for (const id of existing) {
      if (!newMediaIds.includes(id)) {
        deleteStmt.run(id);
      }
    }
  });

  tx(data);
}


module.exports = {
  savePlanogram,
  getPlanogram,
  saveSales,
  saveAssignedMedia,
  db
};
