const express = require('express');
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, duplicateBook, toggleFavorite, generateShareLink, getSharedBook } = require('../controllers/book.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/share/:token', getSharedBook);
router.use(protect);

router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.post('/:id/duplicate', duplicateBook);
router.put('/:id/favorite', toggleFavorite);
router.post('/:id/share', generateShareLink);

module.exports = router;
