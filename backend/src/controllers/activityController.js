import { PrismaClient } from "@prisma/client";
import { emitToUser } from "../utils/socket.js";

const prisma = new PrismaClient();

export const addActivity = async (req, res) => {
  const { type, content, leadId, metadata } = req.body;
  if (!type || !content || !leadId) return res.status(400).json({ message: "Missing fields" });

  const activity = await prisma.activity.create({
    data: { type, content, leadId: Number(leadId), userId: req.user.id, metadata }
  });

  // emit to lead owner and participants
  const lead = await prisma.lead.findUnique({ where: { id: Number(leadId) } });
  if (lead) emitToUser(lead.ownerId, "activityCreated", { activity });

  res.status(201).json(activity);
};
