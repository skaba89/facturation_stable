const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../config/constants');
// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-key'; // Now from constants.js

/**
 * Middleware to check if the user's profile_type allows access to a route.
 * @param {string[]} allowedProfileTypes - Array of profile_type strings that are allowed.
 */
exports.checkRole = (allowedProfileTypes) => {
    return (req, res, next) => {
        try {
            // 1. Get token from header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized: No token provided.' });
            }
            const token = authHeader.split(' ')[1];

            // 2. Verify token
            const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

            // 3. Check profile_type
            const userProfileType = decodedToken.profileType; // Matches payload from authController
            if (!userProfileType) {
                return res.status(403).json({ message: 'Forbidden: Profile type not found in token.' });
            }

            if (allowedProfileTypes.includes(userProfileType)) {
                req.user = decodedToken; // Attach decoded token (user info) to request object
                next(); // User has one of the allowed profile types
            } else {
                return res.status(403).json({ message: 'Forbidden: You do not have the required profile type for this resource.' });
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized: Token expired.' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
            }
            console.error('checkRole middleware error:', error);
            return res.status(500).json({ message: 'Internal server error during authorization.' });
        }
    };
};
