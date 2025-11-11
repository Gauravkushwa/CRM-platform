// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import prisma from "../prismaClient.js";
import { requireOwnerOrRole } from "../middlewares/ownership.js";
import { getAllUsers, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Admin only: list all users
router.get("/", authMiddleware, requireRole("Admin"), getAllUsers);

// Helper to fetch user resource owner info (for self-access)
const getUserResource = async (req) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return null;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  return user;
};

// GET /api/users/:id  -> Admin or self
router.get("/:id", authMiddleware, requireOwnerOrRole(getUserResource, "Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/:id -> Admin or self (profile update)
router.put("/:id", authMiddleware, requireOwnerOrRole(getUserResource, "Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    // if password change, your controller should hash it; keep simple here
    if (password) data.password = password;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/users/:id -> Admin only
router.delete("/:id", authMiddleware, requireRole("Admin"), deleteUser);

export default router;
