const express = require('express');
const router = express.Router();
const { inviteMember } = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireEnterprise } = require('../middleware/subscription.middleware');

router.use(protect);
router.post('/invite', requireEnterprise, inviteMember);

module.exports = router;
