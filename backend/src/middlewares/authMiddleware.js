// middleware/auth.js
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user from DB to ensure it still exists and get the role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }, // load role relation (model-based RBAC)
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    // Normalize role field: works for enum or relation model
    let roleName = null;
    if (typeof user.role === "string") {
      roleName = user.role; // enum style
    } else if (user.role && typeof user.role === "object") {
      roleName = user.role.name; // model style
    }

    // Attach clean user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleName,
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Authentication failed" });
  }
};
