const checkRole = (...allowRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Avval tizimga kiring",
      });
    }

    if (!allowRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Sizda bu amal bajarish uchun ruhsat yo",
      });
    }
    next();
  };
};

export { checkRole };
