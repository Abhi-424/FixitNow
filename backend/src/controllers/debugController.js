const User = require('../models/User');

const debugUsers = async (req, res) => {
    try {
        const allUsers = await User.find({}).select('-password');
        const usersByRole = {
            admin: allUsers.filter(u => u.role === 'admin'),
            user: allUsers.filter(u => u.role === 'user'),
            provider: allUsers.filter(u => u.role === 'provider')
        };
        
        res.json({
            total: allUsers.length,
            byRole: {
                admin: usersByRole.admin.length,
                user: usersByRole.user.length,
                provider: usersByRole.provider.length
            },
            users: allUsers.map(u => ({
                _id: u._id,
                username: u.username,
                email: u.email,
                role: u.role
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { debugUsers };
