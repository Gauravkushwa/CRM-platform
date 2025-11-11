// controllers/activityController.js
import prisma from "../prismaClient.js";
import { broadcast, emitToUser } from "../utils/socket.js";

/**
 * POST /api/leads/:leadId/activities
 * Body: { type, content, metadata }
 * Allowed: owner of lead OR Admin/Manager OR any authenticated user (depending on policy).
 * Here: allow owner OR Admin/Manager OR SalesExecutive (so sales can add activities for their leads).
 */
export const createActivity = async (req, res) => {
  try {
    const leadId = Number(req.params.leadId);
    const { type, content, metadata } = req.body;

    // Ensure lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const activity = await prisma.activity.create({
      data: {
        type,
        content,
        leadId,
        userId: req.user.id,
        metadata,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Add a leadHistory entry for this activity (optional)
    try {
      await prisma.leadHistory.create({
        data: {
          leadId,
          changedBy: req.user.id,
          field: "activity",
          oldValue: null,
          newValue: JSON.stringify({ type, content }),
          metadata: { activityId: activity.id },
        },
      });
    } catch (hErr) {
      console.warn("createActivity: failed to write history:", hErr);
    }

    // Notify lead owner and broadcast activity creation
    if (lead.ownerId) {
      emitToUser(lead.ownerId, "activity:added", { activity, leadId });
    }
    broadcast("activity:created", { activity, leadId });

    return res.status(201).json({ activity });
  } catch (err) {
    console.error("createActivity error:", err);
    return res.status(500).json({ message: "Server error creating activity" });
  }
};

/**
 * GET /api/leads/:leadId/activities
 * Returns activities for a lead (paginated)
 */
export const getActivitiesForLead = async (req, res) => {
  try {
    const leadId = Number(req.params.leadId);
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(200, parseInt(req.query.limit ?? "50", 10));
    const skip = (page - 1) * limit;

    // ensure lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const total = await prisma.activity.count({ where: { leadId } });
    const activities = await prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.json({
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data: activities,
    });
  } catch (err) {
    console.error("getActivitiesForLead error:", err);
    return res.status(500).json({ message: "Server error fetching activities" });
  }
};

/**
 * GET /api/activities/:id
 */
export const getActivityById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, ownerId: true } },
      },
    });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    return res.json({ activity });
  } catch (err) {
    console.error("getActivityById error:", err);
    return res.status(500).json({ message: "Server error fetching activity" });
  }
};

/**
 * DELETE /api/activities/:id
 * Allowed: activity owner (creator) OR Admin/Manager
 */
export const deleteActivity = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const act = await prisma.activity.findUnique({ where: { id } });
    if (!act) return res.status(404).json({ message: "Activity not found" });

    await prisma.activity.delete({ where: { id } });

    // Optionally add leadHistory entry
    try {
      await prisma.leadHistory.create({
        data: {
          leadId: act.leadId,
          changedBy: req.user.id,
          field: "activity:deleted",
          oldValue: JSON.stringify({ activityId: id, content: act.content }),
          newValue: null,
        },
      });
    } catch (hErr) {
      console.warn("deleteActivity: failed to write history:", hErr);
    }

    // Notify
    if (act.userId) emitToUser(act.userId, "activity:deleted", { activityId: id });
    broadcast("activity:deleted", { activityId: id, leadId: act.leadId });

    return res.json({ message: "Activity deleted" });
  } catch (err) {
    console.error("deleteActivity error:", err);
    return res.status(500).json({ message: "Server error deleting activity" });
  }
};

export default {
  createActivity,
  getActivitiesForLead,
  getActivityById,
  deleteActivity,
};
