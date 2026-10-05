const User = require('../models/User.model');
const Book = require('../models/Book.model');

// @desc Get all users with stats (Admin only)
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    
    // Add book count to each user object dynamically
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookCount = await Book.countDocuments({ owner: u._id });
        const userObj = u.toObject();
        userObj.bookCount = bookCount;
        return userObj;
      })
    );

    res.json({ success: true, users: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user plan / role (Admin only)
// @route PUT /api/admin/users/:id/plan
const updateUserPlan = async (req, res) => {
  try {
    const { subscriptionPlan, subscriptionStatus, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (subscriptionPlan) {
      user.subscriptionPlan = subscriptionPlan;
      user.plan = subscriptionPlan.toLowerCase();
    }
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (role) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User plan updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUserPlan };
