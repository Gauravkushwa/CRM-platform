// middleware/ownership.js
import prisma from "../prismaClient.js";

/**
 * requireOwnerOrRole(resourceGetter, ...allowedRoles)
 *
 * resourceGetter: async (req) => ({ ownerId: number } | null)
 * allowedRoles: list of role names that bypass ownership (e.g., "Admin", "Manager")
 *
 * Example:
 *  router.put("/:id", authMiddleware, requireOwnerOrRole(getLeadResource, "Admin", "Manager"), updateLead);
 */
export const requireOwnerOrRole = (resourceGetter, ...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is present from authMiddleware
      if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

      // Normalize user's role string (works for both enum or relation)
      let userRole = req.user.role;
      if (!userRole && req.user.roleName) userRole = req.user.roleName;
      if (req.user.role && typeof req.user.role === "object" && req.user.role.name) userRole = req.user.role.name;

      // If user has one of the allowed roles -> allow
      if (allowedRoles && allowedRoles.length > 0) {
        if (allowedRoles.includes(userRole)) return next();
      }

      // Fetch resource to check owner
      const resource = await resourceGetter(req);
      if (!resource) return res.status(404).json({ message: "Resource not found" });

      const ownerId = resource.ownerId ?? resource.userId ?? resource.createdBy ?? null;
      if (!ownerId) {
        // If resource has no owner field, deny by default (or allow if you prefer)
        return res.status(403).json({ message: "Forbidden: no ownership info" });
      }

      if (Number(ownerId) === Number(req.user.id)) return next();

      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    } catch (err) {
      console.error("requireOwnerOrRole error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
