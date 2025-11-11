// services/leadService.js
import prisma from "../prismaClient.js";
import deepDiff from "deep-diff"; // optional helper; you can compute diffs manually

// helper to compute a simple object diff (returns changed keys with { before, after })
function computeDiff(before = {}, after = {}) {
  const diff = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    const bv = before[k];
    const av = after[k];
    // treat JSON differently if needed
    if (JSON.stringify(bv) !== JSON.stringify(av)) {
      diff[k] = { before: bv === undefined ? null : bv, after: av === undefined ? null : av };
    }
  }
  return diff;
}

export async function createLead(data, actorId) {
  // create lead and history in a transaction
  const result = await prisma.$transaction(async (prismaTx) => {
    const lead = await prismaTx.lead.create({
      data: {
        title: data.title,
        company: data.company,
        email: data.email,
        phone: data.phone,
        value: data.value,
        status: data.status ?? "NEW",
        ownerId: data.ownerId ?? null,
        meta: data.meta ?? null,
      },
    });

    await prismaTx.leadHistory.create({
      data: {
        leadId: lead.id,
        action: "CREATE",
        actorId,
        changes: { created: lead },
        note: data.note ?? null,
      },
    });

    return lead;
  });

  return result;
}

export async function updateLead(leadId, updates, actorId) {
  const result = await prisma.$transaction(async (prismaTx) => {
    const before = await prismaTx.lead.findUnique({ where: { id: leadId } });
    if (!before || before.isDeleted) throw new Error("Lead not found");

    const lead = await prismaTx.lead.update({
      where: { id: leadId },
      data: {
        ...updates,
      },
    });

    const diff = computeDiff(before, lead);

    await prismaTx.leadHistory.create({
      data: {
        leadId: lead.id,
        action: "UPDATE",
        actorId,
        changes: diff,
        note: updates.note ?? null,
      },
    });

    return lead;
  });

  return result;
}

export async function transferLead(leadId, newOwnerId, actorId, note) {
  const result = await prisma.$transaction(async (prismaTx) => {
    const before = await prismaTx.lead.findUnique({ where: { id: leadId } });
    if (!before || before.isDeleted) throw new Error("Lead not found");

    const lead = await prismaTx.lead.update({
      where: { id: leadId },
      data: {
        ownerId: newOwnerId,
      },
    });

    await prismaTx.leadHistory.create({
      data: {
        leadId: lead.id,
        action: "TRANSFER",
        actorId,
        changes: { from: before.ownerId ?? null, to: newOwnerId },
        note: note ?? null,
      },
    });

    return lead;
  });

  return result;
}

export async function deleteLead(leadId, actorId, softDelete = true) {
  if (softDelete) {
    const result = await prisma.$transaction(async (prismaTx) => {
      const before = await prismaTx.lead.findUnique({ where: { id: leadId } });
      if (!before || before.isDeleted) throw new Error("Lead not found");

      const lead = await prismaTx.lead.update({
        where: { id: leadId },
        data: { isDeleted: true },
      });

      await prismaTx.leadHistory.create({
        data: {
          leadId: lead.id,
          action: "DELETE",
          actorId,
          changes: { before: before },
        },
      });

      return lead;
    });

    return result;
  } else {
    // hard delete
    const result = await prisma.$transaction(async (prismaTx) => {
      const before = await prismaTx.lead.findUnique({ where: { id: leadId } });
      if (!before) throw new Error("Lead not found");

      await prismaTx.leadHistory.create({
        data: {
          leadId,
          action: "DELETE",
          actorId,
          changes: { before },
        },
      });

      const lead = await prismaTx.lead.delete({ where: { id: leadId } });
      return lead;
    });

    return result;
  }
}

export async function getLead(leadId) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: { owner: true, histories: { orderBy: { createdAt: "desc" } } },
  });
}

export async function listLeads({ role, userId, filter = {}, skip = 0, take = 20 }) {
  // apply ownership rules at service level: Admin/Manager see all; Sales sees only own leads
  const where = { isDeleted: false, ...filter };

  if (role === "SALES") {
    where.ownerId = userId;
  }

  return prisma.lead.findMany({
    where,
    include: { owner: true },
    skip,
    take,
    orderBy: { updatedAt: "desc" },
  });
}
