// Placeholder for Auth Middleware

// const jwtUtils = require('../utils/jwtUtils');
// const User = require('../models/user'); // Assuming User model is set up

const authMiddleware = {
  /**
   * Middleware to verify JWT from request headers.
   * Attaches user information to the request object if token is valid.
   */
  verifyToken: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // In a real implementation, use jwtUtils.verifyToken and fetch user
    // const decoded = jwtUtils.verifyToken(token);
    // if (!decoded) {
    //   return res.status(401).json({ message: 'Invalid token.' });
    // }

    // Mock user data for now, assuming token is just a user ID or includes roles
    // In a real scenario, you'd fetch the user from the DB based on decoded.userId
    // and then check their roles.
    if (token === 'sample_jwt_token_for_admin') {
      req.user = { id: 'admin_user_id', roles: ['user', 'admin'], email: 'admin@example.com', profile_type: 'sme' };
    } else if (token && token.startsWith('sample_jwt_token_for_')) {
        const userId = token.replace('sample_jwt_token_for_', '');
        req.user = { id: userId, roles: ['user'], email: `${userId}@example.com`, profile_type: 'freelance' }; // Default to 'user' role
    } else {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    // try {
    //   const user = await User.findById(decoded.userId).select('-password'); // Exclude password
    //   if (!user) {
    //     return res.status(404).json({ message: 'User not found.' });
    //   }
    //   req.user = user; // Add user object to request
    //   next();
    // } catch (error) {
    //   return res.status(500).json({ message: 'Error verifying token.' });
    // }
    next();
  },

  /**
   * Middleware factory to check if the authenticated user has at least one of the specified roles.
   * @param {string|string[]} roleOrRoles - A single role string or an array of role strings.
   * @returns {function} - Middleware function.
   */
  hasRole: (roleOrRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Access forbidden. User roles not available.' });
      }

      const allowedRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
      const userHasRole = req.user.roles.some(role => allowedRoles.includes(role));

      if (!userHasRole) {
        return res.status(403).json({
          message: `Access forbidden. User does not have required role(s): ${allowedRoles.join(', ')}.`
        });
      }
      next();
    };
  }
};

module.exports = authMiddleware;
