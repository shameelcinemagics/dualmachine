  const axios = require('axios');
  const {fetchPlanogram} = require('../utils/fetchSupabase');

exports.fetchplano = async(req,res)=>{
    fetchPlanogram()
}