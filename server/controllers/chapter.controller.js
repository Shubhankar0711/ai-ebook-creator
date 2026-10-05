const Chapter = require('../models/Chapter.model');
const Book = require('../models/Book.model');

// @desc Get chapters for a book
// @route GET /api/chapters/book/:bookId
const getChapters = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const chapters = await Chapter.find({ bookId: req.params.bookId }).sort('chapterNumber');
    res.json({ success: true, chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create chapter
// @route POST /api/chapters
const createChapter = async (req, res) => {
  try {
    const { title, content, bookId } = req.body;

    const book = await Book.findOne({ _id: bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Check plan limits for FREE plan
    if (req.user.subscriptionPlan === 'FREE') {
      const chapterCount = await Chapter.countDocuments({ bookId });
      if (chapterCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Limit reached: Free plan is limited to 5 chapters per book. Please upgrade to Pro.',
          limitReached: true
        });
      }
    }

    const lastChapter = await Chapter.findOne({ bookId }).sort('-chapterNumber');
    const chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

    const chapter = await Chapter.create({ title, content: content || '', chapterNumber, bookId });

    // Update book chapter count & word count
    const allChapters = await Chapter.find({ bookId });
    const totalWords = allChapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    await Book.findByIdAndUpdate(bookId, {
      chapterCount: allChapters.length,
      wordCount: totalWords,
      readingTime: Math.ceil(totalWords / 200)
    });

    res.status(201).json({ success: true, message: 'Chapter created', chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update chapter
// @route PUT /api/chapters/:id
const updateChapter = async (req, res) => {
  try {
    const { title, content, notes } = req.body;
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    // Verify ownership
    const book = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
    if (!book) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Save version
    if (content !== undefined && chapter.content !== content) {
      chapter.versions = chapter.versions || [];
      if (chapter.versions.length >= 10) chapter.versions.shift();
      chapter.versions.push({ content: chapter.content, savedAt: new Date() });
    }

    if (title !== undefined) chapter.title = title;
    if (content !== undefined) chapter.content = content;
    if (notes !== undefined) chapter.notes = notes;

    await chapter.save();

    // Update book stats
    const allChapters = await Chapter.find({ bookId: chapter.bookId });
    const totalWords = allChapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    await Book.findByIdAndUpdate(chapter.bookId, {
      wordCount: totalWords,
      readingTime: Math.ceil(totalWords / 200),
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Chapter saved', chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete chapter
// @route DELETE /api/chapters/:id
const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const book = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
    if (!book) return res.status(403).json({ success: false, message: 'Not authorized' });

    const bookId = chapter.bookId;
    await Chapter.findByIdAndDelete(req.params.id);

    // Renumber remaining chapters
    const remaining = await Chapter.find({ bookId }).sort('chapterNumber');
    for (let i = 0; i < remaining.length; i++) {
      await Chapter.findByIdAndUpdate(remaining[i]._id, { chapterNumber: i + 1 });
    }

    await Book.findByIdAndUpdate(bookId, { chapterCount: remaining.length });
    res.json({ success: true, message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reorder chapters
// @route PUT /api/chapters/reorder
const reorderChapters = async (req, res) => {
  try {
    const { bookId, chapters } = req.body; // chapters: [{_id, chapterNumber}]

    if (!bookId || !Array.isArray(chapters)) {
      return res.status(400).json({ success: false, message: 'Invalid payload for reordering chapters' });
    }

    const book = await Book.findOne({ _id: bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    for (const ch of chapters) {
      if (ch._id && typeof ch.chapterNumber === 'number') {
        await Chapter.findOneAndUpdate(
          { _id: ch._id, bookId: book._id },
          { chapterNumber: ch.chapterNumber }
        );
      }
    }

    res.json({ success: true, message: 'Chapters reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getChapters, createChapter, updateChapter, deleteChapter, reorderChapters };
