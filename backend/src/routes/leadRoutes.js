// routes/leadRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireOwnerOrRole } from "../middlewares/ownership.js";
import leadController from "../controllers/leadController.js";
import prisma from "../prismaClient.js";

const router = express.Router();

// helper to fetch lead ownerId for ownership middleware
const getLeadResource = async (req) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return null;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { ownerId: true } });
  return lead;
};

// Create lead - any logged-in Sales/Manager/Admin
router.post("/", authMiddleware, requireRole("Admin", "Manager", "SalesExecutive", "SALES"), leadController.createLead);

// List leads - authenticated users
router.get("/", authMiddleware, leadController.getLeads);

// Get single lead - authenticated
router.get("/:id", authMiddleware, leadController.getLeadById);

// Update lead - owner OR Admin/Manager
router.put(
  "/:id",
  authMiddleware,
  requireOwnerOrRole(getLeadResource, "Admin", "Manager"),
  leadController.updateLead
);

// Delete lead - Admin & Manager only
router.delete("/:id", authMiddleware, requireRole("Admin", "Manager"), leadController.deleteLead);

// Assign lead - Admin & Manager only
router.post("/:id/assign", authMiddleware, requireRole("Admin", "Manager"), leadController.assignLead);

export default router;
