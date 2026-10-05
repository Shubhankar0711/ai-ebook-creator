const express = require('express');
const router = express.Router();
const {
  getPlans,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  cancelPlan,
  handleWebhook,
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.post('/cancel', cancelPlan);

module.exports = router;
