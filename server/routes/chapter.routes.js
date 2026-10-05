const express = require('express');
const router = express.Router();
const { getChapters, createChapter, updateChapter, deleteChapter, reorderChapters } = require('../controllers/chapter.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/book/:bookId', getChapters);  // GET /api/chapters/book/:bookId
router.post('/', createChapter);
router.put('/reorder', reorderChapters);   // PUT /api/chapters/reorder (must be before /:id)
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

module.exports = router;
