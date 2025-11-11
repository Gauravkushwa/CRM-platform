// controllers/leadController.js
import prisma from "../prismaClient.js";
import { emitToUser, broadcast } from "../utils/socket.js";

/**
 * GET /api/leads
 */
export const getLeads = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit ?? "20", 10));
    const skip = (page - 1) * limit;

    const { status, ownerId, search } = req.query;
    let { sortBy = "updatedAt", sortOrder = "desc" } = req.query;

    const allowedSortFields = ["createdAt", "updatedAt", "name"];
    if (!allowedSortFields.includes(sortBy)) sortBy = "updatedAt";
    sortOrder = sortOrder === "asc" ? "asc" : "desc";

    const where = {};
    if (status) where.status = status;
    if (ownerId) where.ownerId = Number(ownerId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return res.json({
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data: leads,
    });
  } catch (err) {
    console.error("getLeads error:", err);
    return res.status(500).json({ message: "Server error fetching leads" });
  }
};

/**
 * GET /api/leads/:id
 */
export const getLeadById = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        histories: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    return res.json({ lead });
  } catch (err) {
    console.error("getLeadById error:", err);
    return res.status(500).json({ message: "Server error fetching lead" });
  }
};

/**
 * POST /api/leads
 */
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, status = "New", source, ownerId, description, metadata } = req.body;

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        status,
        source,
        ownerId: ownerId ? Number(ownerId) : undefined,
        description,
        metadata,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await prisma.leadHistory.create({
      data: {
        leadId: lead.id,
        changedBy: req.user.id,
        field: "created",
        oldValue: null,
        newValue: JSON.stringify({ name, status }),
      },
    });

    // 🔔 Notify the owner (if assigned) and broadcast to others
    if (ownerId) emitToUser(ownerId, "lead:assigned", { lead, assignedBy: req.user });
    broadcast("lead:created", { lead });

    return res.status(201).json({ lead });
  } catch (err) {
    console.error("createLead error:", err);
    return res.status(500).json({ message: "Server error creating lead" });
  }
};

/**
 * PUT /api/leads/:id
 */
export const updateLead = async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const updateData = req.body;

    const oldLead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!oldLead) return res.status(404).json({ message: "Lead not found" });

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    const fieldsToTrack = ["status", "ownerId", "phone", "email", "name", "description"];
    const changes = [];
    for (const field of fieldsToTrack) {
      const oldVal = oldLead[field] ?? null;
      const newVal = updated[field] ?? null;
      if (String(oldVal) !== String(newVal)) {
        changes.push({ field, oldValue: oldVal, newValue: newVal });
      }
    }

    for (const c of changes) {
      await prisma.leadHistory.create({
        data: {
          leadId,
          changedBy: req.user.id,
          field: c.field,
          oldValue: c.oldValue ? String(c.oldValue) : null,
          newValue: c.newValue ? String(c.newValue) : null,
        },
      });
    }

    // 🔔 Emit socket notifications
    broadcast("lead:updated", { lead: updated, changes });
    if (updated.ownerId) emitToUser(updated.ownerId, "lead:updateNotice", { lead: updated, changes });

    return res.json({ lead: updated, changes });
  } catch (err) {
    console.error("updateLead error:", err);
    return res.status(500).json({ message: "Server error updating lead" });
  }
};

/**
 * DELETE /api/leads/:id
 */
export const deleteLead = async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const existing = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!existing) return res.status(404).json({ message: "Lead not found" });

    await prisma.lead.delete({ where: { id: leadId } });

    await prisma.leadHistory.create({
      data: {
        leadId,
        changedBy: req.user.id,
        field: "deleted",
        oldValue: JSON.stringify({ name: existing.name, status: existing.status }),
        newValue: null,
      },
    });

    // 🔔 Notify everyone
    broadcast("lead:deleted", { id: leadId, deletedBy: req.user.id });

    return res.json({ message: "Lead deleted" });
  } catch (err) {
    console.error("deleteLead error:", err);
    return res.status(500).json({ message: "Server error deleting lead" });
  }
};

/**
 * POST /api/leads/:id/assign
 */
export const assignLead = async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const ownerId = Number(req.body.ownerId);

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { ownerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    await prisma.leadHistory.create({
      data: {
        leadId,
        changedBy: req.user.id,
        field: "ownerId",
        oldValue: lead.ownerId ? String(lead.ownerId) : null,
        newValue: String(ownerId),
        metadata: { note: `Assigned by ${req.user.name}` },
      },
    });

    // 🔔 Notify new owner specifically
    emitToUser(ownerId, "lead:assigned", { lead: updated, assignedBy: req.user });
    // 🔔 Broadcast to everyone
    broadcast("lead:assignmentUpdate", { lead: updated });

    return res.json({ lead: updated });
  } catch (err) {
    console.error("assignLead error:", err);
    return res.status(500).json({ message: "Server error assigning lead" });
  }
};

export default {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
};
