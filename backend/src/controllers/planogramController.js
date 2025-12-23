const axios = require('axios');
const { fetchPlanogram } = require('../utils/fetchSupabase');

exports.fetchplano = async (req, res) => {
  try {
    await fetchPlanogram();
    res.status(200).json({ success: true, message: 'Planogram updated successfully' });
  } catch (error) {
    console.error('Planogram update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update planogram' });
  }
};