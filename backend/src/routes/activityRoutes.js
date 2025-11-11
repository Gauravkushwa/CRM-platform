// routes/activityRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { requireOwnerOrRole } from "../middlewares/ownership.js";
import activityController from "../controllers/activityController.js";
import prisma from "../prismaClient.js";

const router = express.Router();

/**
 * resource getter helpers for ownership middleware
 */
const getLeadResource = async (req) => {
  const leadId = Number(req.params.leadId);
  if (Number.isNaN(leadId)) return null;
  return prisma.lead.findUnique({ where: { id: leadId }, select: { ownerId: true } });
};

const getActivityResource = async (req) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return null;
  return prisma.activity.findUnique({ where: { id }, select: { userId: true, leadId: true } });
}

/**
 * Routes
 */

// Create activity under a lead
// Allow: owner OR Admin/Manager OR SalesExecutive (so sales can add for their lead)
router.post(
  "/leads/:leadId/activities",
  authMiddleware,
  requireOwnerOrRole(getLeadResource, "Admin", "Manager", "SalesExecutive"),
  activityController.createActivity
);

// List activities for a lead (any authenticated user)
router.get("/leads/:leadId/activities", authMiddleware, activityController.getActivitiesForLead);

// Get single activity
router.get("/activities/:id", authMiddleware, activityController.getActivityById);

// Delete activity: owner (creator) OR Admin/Manager
router.delete(
  "/activities/:id",
  authMiddleware,
  requireOwnerOrRole(getActivityResource, "Admin", "Manager"),
  activityController.deleteActivity
);

export default router;
