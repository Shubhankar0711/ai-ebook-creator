const express = require('express');
const router = express.Router();
const { getAnalytics, getFavoriteBooks } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/analytics', getAnalytics);
router.get('/favorites', getFavoriteBooks);

module.exports = router;
