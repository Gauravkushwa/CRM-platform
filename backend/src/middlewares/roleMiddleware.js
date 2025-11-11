
/**
 * requireRole(...allowedRoles)
 * allowedRoles example: requireRole("Admin", "Manager")
 */
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  // Determine roleName whether role is string (enum style) or object (model style)
  let roleName = null;
  if (typeof req.user.role === "string") {
    roleName = req.user.role;
  } else if (req.user.role && typeof req.user.role === "object") {
    roleName = req.user.role.name;
  }

  if (!roleName) return res.status(403).json({ message: "Forbidden: no role" });

  if (!allowedRoles.includes(roleName)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }

  next();
};
