// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function ensureRole(name) {
  // upsert role row (name must be unique in Role model)
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertUserWithRole({ email, name, plainPassword, roleId }) {
  const hashed = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // update fields and connect role if needed
    return prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashed,
        role: { connect: { id: roleId } },
      },
    });
  } else {
    return prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: { connect: { id: roleId } },
      },
    });
  }
}

async function main() {
  console.log("Seeding database...");

  // Use consistent role names (uppercase or whatever you prefer)
  const adminRole = await ensureRole("ADMIN");
  const managerRole = await ensureRole("MANAGER");
  const salesRole = await ensureRole("SALES");
  console.log("Roles ensured:", adminRole.name, managerRole.name, salesRole.name);

  // 2) Ensure users with connected roles
  const admin = await upsertUserWithRole({
    email: "admin@crm.local",
    name: "CRM Admin",
    plainPassword: "Admin@123",
    roleId: adminRole.id,
  });
  console.log("Admin user ensured:", admin.email);

  const alice = await upsertUserWithRole({
    email: "alice@crm.local",
    name: "Alice Manager",
    plainPassword: "Alice@123",
    roleId: managerRole.id,
  });

  const bob = await upsertUserWithRole({
    email: "bob@crm.local",
    name: "Bob Sales",
    plainPassword: "Bob@123",
    roleId: salesRole.id,
  });

  console.log("Sample users ensured:", alice.email, bob.email);

  // 3) Create sample leads using findFirst/create (because name isn't unique)
  const existingLead1 = await prisma.lead.findFirst({ where: { name: "Acme Corp" } });
  let lead1;
  if (!existingLead1) {
    lead1 = await prisma.lead.create({
      data: {
        name: "Acme Corp",
        email: "contact@acmecorp.com",
        phone: "+1-202-555-0123",
        status: "Contacted",
        source: "Website",
        ownerId: bob.id,
        description: "Interested in enterprise plan",
        metadata: { companySize: 120, industry: "Manufacturing" },
      },
    });
    console.log("Lead created:", lead1.name);
  } else {
    lead1 = existingLead1;
    console.log("Lead already exists:", lead1.name);
  }

  const existingLead2 = await prisma.lead.findFirst({ where: { name: "Beta Solutions" } });
  let lead2;
  if (!existingLead2) {
    lead2 = await prisma.lead.create({
      data: {
        name: "Beta Solutions",
        email: "hello@betasolutions.com",
        phone: "+1-303-555-0456",
        status: "New",
        source: "Referral",
        ownerId: alice.id,
        description: "Asked for demo",
        metadata: { referralBy: "Acme Corp" },
      },
    });
    console.log("Lead created:", lead2.name);
  } else {
    lead2 = existingLead2;
    console.log("Lead already exists:", lead2.name);
  }

  // 4) Activities (create if not present)
  const activities = await prisma.activity.findMany({ where: { leadId: lead1.id } });
  if (activities.length === 0) {
    await prisma.activity.create({
      data: {
        type: "Call",
        content: "Intro call — interested in pricing",
        leadId: lead1.id,
        userId: bob.id,
        metadata: { durationMin: 12 },
      },
    });

    await prisma.activity.create({
      data: {
        type: "Note",
        content: "Sent follow-up email with pricing PDF",
        leadId: lead1.id,
        userId: bob.id,
      },
    });

    console.log("Activities created for", lead1.name);
  } else {
    console.log("Activities already exist for", lead1.name);
  }

  // 5) Lead history entry (create only if not exists)
  const histories = await prisma.leadHistory.findMany({ where: { leadId: lead1.id } });
  if (histories.length === 0) {
    await prisma.leadHistory.create({
      data: {
        leadId: lead1.id,
        action: "UPDATE",
        actorId: bob.id,
        changes: { field: "status", oldValue: "New", newValue: "Contacted" }, // JSON diff
        note: "Status changed after intro call",
      },
    });
    console.log("Lead history created for", lead1.name);
  } else {
    console.log("Lead history exists for", lead1.name);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
