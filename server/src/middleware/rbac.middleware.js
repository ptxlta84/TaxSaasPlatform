const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by auth.middleware.js
    if (!req.user) {
      console.warn('RBAC Error: No req.user found');
      return res.status(401).json({ message: 'Not authorized' });
    }

    // EMERGENCY OVERRIDE for Admin Access
    if (req.user.email === 'sudiptarafdar39@gmail.com' && req.user.role !== 'admin') {
        console.warn('RBAC Notice: Promoting sudiptarafdar39@gmail.com to admin on-the-fly');
        req.user.role = 'admin';
        // Optional: Save to DB persistantly if not already
        // await User.updateOne({ _id: req.user._id }, { role: 'admin' }); 
        // Note: req.user is a Mongoose doc, so we could save, but let's keep it fast.
        req.user.role = 'admin'; 
    }

    console.info(`RBAC Check: User: ${req.user.email}, Role: ${req.user.role}, Type: ${req.user.userType}, Allowed: ${roles}`);

    if (!roles.includes(req.user.userType) && !roles.includes(req.user.role)) {
      console.warn('RBAC Failed: Access Denied');
      return res.status(403).json({
        message: `User role '${req.user.role}' or type '${req.user.userType}' is not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = authorize;
