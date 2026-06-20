const jwt = require('jsonwebtoken');
const User = require('../models/Users');

/**
 * protect — Verifies JWT token from Authorization header.
 * Attaches the full user object to req.user on success.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user from DB (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
        }

        req.user = user; // Attach full user to request
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ message: 'Server error during authentication.' });
    }
};

/**
 * authorize — Role-based access control.
 * Must be used AFTER protect middleware.
 * @param {...string} roles - Allowed roles e.g. authorize('admin', 'cm')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user?.role}' is not authorized to perform this action.`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
