const User = require('../models/User.model');
const Book = require('../models/Book.model');
const Chapter = require('../models/Chapter.model');

// @desc Get user analytics/stats
// @route GET /api/users/analytics
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalBooks = await Book.countDocuments({ owner: userId });
    const completedBooks = await Book.countDocuments({ owner: userId, status: 'completed' });
    const draftBooks = await Book.countDocuments({ owner: userId, status: 'draft' });
    const favoriteBooks = await Book.countDocuments({ owner: userId, isFavorite: true });

    const wordCountAgg = await Book.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, total: { $sum: '$wordCount' } } }
    ]);
    const totalWords = wordCountAgg[0]?.total || 0;

    const recentBooks = await Book.find({ owner: userId })
      .sort('-updatedAt')
      .limit(5)
      .select('title genre status wordCount updatedAt coverImage');

    const user = await User.findById(userId).select('recentActivity');

    res.json({
      success: true,
      analytics: {
        totalBooks,
        completedBooks,
        draftBooks,
        favoriteBooks,
        totalWords,
        totalReadingTime: Math.ceil(totalWords / 200),
        recentBooks,
        recentActivity: user.recentActivity?.slice(-10).reverse() || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get favorite books
// @route GET /api/users/favorites
const getFavoriteBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id, isFavorite: true }).sort('-updatedAt');
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics, getFavoriteBooks };
