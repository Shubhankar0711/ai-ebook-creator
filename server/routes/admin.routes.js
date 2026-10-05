const express = require('express');
const router = express.Router();
const { getUsers, updateUserPlan } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/subscription.middleware');

router.use(protect);
router.use(isAdmin);

router.get('/users', getUsers);
router.put('/users/:id/plan', updateUserPlan);

module.exports = router;
