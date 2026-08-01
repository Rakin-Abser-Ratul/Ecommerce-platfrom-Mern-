import User from '../models/User.js';

// @desc    Get public user profile by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'User not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};