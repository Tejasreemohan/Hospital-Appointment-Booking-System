import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        // Assuming user ID is sent via auth middleware somehow, or we can use ID from query/params 
        // For now, since auth middleware isn't strictly enforcing `req.user`, let's get it from a header or query
        // Let's assume the client passes the ID.
        // Or in a real app, `req.user._id` from protect middleware.

        // Let's use `req.user` if it exists (from a protect middleware we might add)
        // If not, we can use a query param `?userId=...` for this demo:
        const userId = req.user ? req.user._id : req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving user profile' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                // In a real app we'd hash this, assuming the model has a pre-save hook for it
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                message: 'Profile updated successfully'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
