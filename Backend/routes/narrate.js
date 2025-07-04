const express = require('express');
const router = express.Router();
const { getNarration } = require('../utils/geoUtils');

router.post('/', async (req, res) => {
  const { start, end, delay } = req.body;
  try {
    const result = await getNarration(start, end, delay);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
