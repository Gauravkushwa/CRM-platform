// prismaClient.js
import { PrismaClient } from "@prisma/client";

// Create a single PrismaClient instance for the whole app
const prisma = new PrismaClient();

// Export it to use in other files
export default prisma;
