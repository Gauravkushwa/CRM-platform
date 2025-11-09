export const authorize = (allowedRoles = []) => (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ message: "No role in token" });
  
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden - insufficient role" });
    }
    next();
  };
  