const Book = require('../models/Book.model');
const Chapter = require('../models/Chapter.model');
const User = require('../models/User.model');
const { v4: uuidv4 } = require('uuid');

// @desc Get all books for user
// @route GET /api/books
const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      status,
      sort = '-createdAt',
    } = req.query;

    const query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) query.genre = genre;
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-versions');

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single book with chapters (Strict ownership check)
// @route GET /api/books/:id
const getBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    const chapters = await Chapter.find({ bookId: book._id }).sort('chapterNumber');
    res.json({ success: true, book, chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create book
// @route POST /api/books
const createBook = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      author,
      genre,
      language,
      tone,
      targetAudience,
      description,
      numberOfChapters,
      coverImage,
    } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Book title is required' });
    }

    // Enforce plan limits for FREE plan
    const plan = req.user.subscriptionPlan || 'FREE';
    if (plan === 'FREE') {
      const bookCount = await Book.countDocuments({ owner: req.user._id });
      if (bookCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Free plan is limited to 5 books. Upgrade to Pro for unlimited books!',
          limitReached: true,
        });
      }
    }

    const book = await Book.create({
      title,
      subtitle,
      author: author || req.user.name,
      genre,
      language,
      tone,
      targetAudience,
      description,
      coverImage: coverImage || '',
      owner: req.user._id,
    });

    // Auto-create initial chapters if requested
    if (numberOfChapters && numberOfChapters > 0) {
      let chaptersToCreate = Math.min(parseInt(numberOfChapters, 10), 50);

      // Free plan max 5 chapters per book
      if (plan === 'FREE') {
        chaptersToCreate = Math.min(chaptersToCreate, 5);
      }

      const chapterDocs = [];
      for (let i = 1; i <= chaptersToCreate; i++) {
        chapterDocs.push({
          title: `Chapter ${i}`,
          content: '',
          chapterNumber: i,
          bookId: book._id,
        });
      }
      await Chapter.insertMany(chapterDocs);
      book.chapterCount = chaptersToCreate;
      await book.save();
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { booksCreated: 1 },
      $push: {
        recentActivity: {
          $each: [{ action: 'created', bookTitle: book.title, bookId: book._id }],
          $slice: -20,
        },
      },
    });

    res.status(201).json({ success: true, message: 'Book created successfully', book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update book (Strict ownership check)
// @route PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    res.json({ success: true, message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete book (Strict ownership check)
// @route DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    // Delete all chapters belonging to this book
    await Chapter.deleteMany({ bookId: req.params.id });

    // Clean up activity log and favorites
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        recentActivity: { bookId: req.params.id },
        favoriteBooks: req.params.id,
      },
    });

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Duplicate book (Strict ownership check)
// @route POST /api/books/:id/duplicate
const duplicateBook = async (req, res) => {
  try {
    const plan = req.user.subscriptionPlan || 'FREE';
    if (plan === 'FREE') {
      const bookCount = await Book.countDocuments({ owner: req.user._id });
      if (bookCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Free plan is limited to 5 books. Please upgrade to Pro.',
          limitReached: true,
        });
      }
    }

    const original = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    const bookData = original.toObject();
    delete bookData._id;
    delete bookData.createdAt;
    delete bookData.updatedAt;
    bookData.title = `${bookData.title} (Copy)`;
    bookData.status = 'draft';
    bookData.isPublic = false;
    bookData.shareToken = '';

    const newBook = await Book.create(bookData);

    let originalChapters = await Chapter.find({ bookId: original._id }).sort('chapterNumber');
    if (plan === 'FREE') {
      originalChapters = originalChapters.slice(0, 5);
    }

    for (const ch of originalChapters) {
      const chData = ch.toObject();
      delete chData._id;
      chData.bookId = newBook._id;
      await Chapter.create(chData);
    }

    res.status(201).json({ success: true, message: 'Book duplicated successfully', book: newBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle favorite (Strict ownership check)
// @route PUT /api/books/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    book.isFavorite = !book.isFavorite;
    await book.save();

    if (book.isFavorite) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { favoriteBooks: book._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $pull: { favoriteBooks: book._id } });
    }

    res.json({ success: true, isFavorite: book.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Generate share link (Strict ownership check)
// @route POST /api/books/:id/share
const generateShareLink = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or unauthorized' });
    }

    if (!book.shareToken) {
      book.shareToken = uuidv4();
    }
    book.isPublic = true;
    await book.save();

    res.json({
      success: true,
      shareToken: book.shareToken,
      shareUrl: `/share/${book.shareToken}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get public book by share token
// @route GET /api/books/share/:token
const getSharedBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      shareToken: req.params.token,
      isPublic: true,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or link has expired' });
    }

    const chapters = await Chapter.find({ bookId: book._id }).sort('chapterNumber');
    res.json({ success: true, book, chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  duplicateBook,
  toggleFavorite,
  generateShareLink,
  getSharedBook,
};
