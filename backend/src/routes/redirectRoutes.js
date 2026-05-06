const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirectController');

// GET /r/:shortCode — public redirect endpoint
router.get('/:shortCode', redirect);

module.exports = router;
