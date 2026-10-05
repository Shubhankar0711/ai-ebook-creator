// @desc Invite a team member (Enterprise only)
// @route POST /api/team/invite
const inviteMember = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Mock invitation logic
    res.json({
      success: true,
      message: `Invitation successfully sent to ${email} as a ${role}!`,
      invitation: {
        email,
        role,
        invitedBy: req.user.name,
        status: 'pending',
        invitedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { inviteMember };
