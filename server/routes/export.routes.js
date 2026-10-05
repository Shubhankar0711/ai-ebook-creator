const express = require('express');
const router = express.Router();
const { exportPDF, exportTXT, exportDOCX } = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePro } = require('../middleware/subscription.middleware');

router.use(protect);
router.post('/pdf/:bookId', exportPDF);
router.get('/txt/:bookId', exportTXT);
router.post('/docx/:bookId', requirePro, exportDOCX);

module.exports = router;
