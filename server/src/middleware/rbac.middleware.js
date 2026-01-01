const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by auth.middleware.js
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.userType) && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' or type '${req.user.userType}' is not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = authorize;
