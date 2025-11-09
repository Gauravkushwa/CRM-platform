import { PrismaClient } from "@prisma/client";
import { emitToUser } from "../utils/socket.js";

const prisma = new PrismaClient();

export const createLead = async (req, res) => {
  const { name, email, phone, ownerId, source, description, metadata } = req.body;
  if (!name || !ownerId) return res.status(400).json({ message: "name and ownerId required" });

  const lead = await prisma.lead.create({
    data: { name, email, phone, ownerId, source, description, metadata }
  });

  // create history record
  await prisma.leadHistory.create({
    data: { leadId: lead.id, changedBy: req.user.id, field: "create", oldValue: null, newValue: JSON.stringify(lead) }
  });

  // emit to owner
  emitToUser(ownerId, "newLead", { lead });

  res.status(201).json(lead);
};

export const getLeads = async (req, res) => {
  const { page = 1, pageSize = 20, status, ownerId, search } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const where = {};

  if (status) where.status = status;
  if (ownerId) where.ownerId = Number(ownerId);
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [total, items] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      skip,
      take: Number(pageSize),
    })
  ]);

  res.json({ total, items });
};

export const getLeadById = async (req, res) => {
  const id = Number(req.params.id);
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      activities: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      histories: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    }
  });
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json(lead);
};

export const updateLead = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, phone, ownerId, status, description, metadata } = req.body;

  const prev = await prisma.lead.findUnique({ where: { id } });
  if (!prev) return res.status(404).json({ message: "Lead not found" });

  const updated = await prisma.lead.update({
    where: { id },
    data: { name, email, phone, ownerId, status, description, metadata }
  });

  // record history fields that changed
  const changes = [];
  if (prev.ownerId !== updated.ownerId) changes.push({ field: "ownerId", oldValue: String(prev.ownerId), newValue: String(updated.ownerId) });
  if (prev.status !== updated.status) changes.push({ field: "status", oldValue: prev.status, newValue: updated.status });
  if (prev.name !== updated.name) changes.push({ field: "name", oldValue: prev.name, newValue: updated.name });

  for (const c of changes) {
    await prisma.leadHistory.create({
      data: { leadId: id, changedBy: req.user.id, field: c.field, oldValue: c.oldValue, newValue: c.newValue }
    });
  }

  // emit notifications
  if (ownerId && prev.ownerId !== ownerId) {
    emitToUser(ownerId, "leadAssigned", { lead: updated });
  }
  emitToUser(prev.ownerId, "leadUpdated", { lead: updated });

  res.json(updated);
};

export const deleteLead = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.lead.delete({ where: { id } });
  res.json({ success: true });
};
