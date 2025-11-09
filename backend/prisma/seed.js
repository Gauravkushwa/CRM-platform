// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1) Create roles (idempotent)
  const roles = ["Admin", "Manager", "SalesExecutive"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Roles ensured");

  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const managerRole = await prisma.role.findUnique({ where: { name: "Manager" } });
  const salesRole = await prisma.role.findUnique({ where: { name: "SalesExecutive" } });

  // 2) Create admin user
  const adminEmail = "admin@crm.local";
  const adminPass = "Admin@123"; // change for prod
  const hashedAdmin = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "CRM Admin",
      email: adminEmail,
      password: hashedAdmin,
      roleId: adminRole.id,
    },
  });
  console.log("Admin user ensured:", admin.email);

  // 3) Create manager & sales users (idempotent)
  const alice = await prisma.user.upsert({
    where: { email: "alice@crm.local" },
    update: {},
    create: {
      name: "Alice Manager",
      email: "alice@crm.local",
      password: await bcrypt.hash("Alice@123", 10),
      roleId: managerRole.id,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@crm.local" },
    update: {},
    create: {
      name: "Bob Sales",
      email: "bob@crm.local",
      password: await bcrypt.hash("Bob@123", 10),
      roleId: salesRole.id,
    },
  });

  console.log("Sample users ensured:", alice.email, bob.email);

  // 4) Create sample leads using findFirst/create (because name isn't unique)
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

  // 5) Activities (create if not present)
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

  // 6) Lead history entry (create only if not exists)
  const histories = await prisma.leadHistory.findMany({ where: { leadId: lead1.id } });
  if (histories.length === 0) {
    await prisma.leadHistory.create({
      data: {
        leadId: lead1.id,
        changedBy: bob.id,
        field: "status",
        oldValue: "New",
        newValue: "Contacted",
        metadata: { reason: "Intro call" },
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
