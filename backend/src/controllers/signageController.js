  const axios = require('axios');
  const {fetchSignage} = require('../utils/fetchSupabase');
  const { db } = require('../db/client')

exports.fetchSignage = async(req,res)=>{
    fetchSignage()
}

exports.getSignage = async(req,res)=>{
  const media = db.prepare('SELECT media_id, url, type, title FROM assigned_media ORDER BY media_id').all();
  res.json(media);
}