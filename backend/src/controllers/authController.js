import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();


export const register = async (req, res) => {
  try {
    console.log("[REGISTER] payload:", req.body);

    const { name, email, password, role = "SALES" } = req.body;
    if (!name || !email || !password) {
      console.warn("[REGISTER] missing fields", { name, email, password });
      return res.status(400).json({ message: "Missing fields: name, email and password are required" });
    }

    // normalize role
    const roleName = String(role || "SALES").trim().toUpperCase();

    // ensure roles exist: try find role, fallback to SALES, create if missing
    let roleObj = await prisma.role.findUnique({ where: { name: roleName } });
    if (!roleObj) {
      console.warn(`[REGISTER] role "${roleName}" not found, falling back to SALES`);
      roleObj = await prisma.role.findUnique({ where: { name: "SALES" } });
    }
    if (!roleObj) {
      console.warn("[REGISTER] default SALES role missing — creating it now");
      roleObj = await prisma.role.create({ data: { name: "SALES" } });
    }

    // double-check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.info("[REGISTER] email already in use:", email);
      return res.status(409).json({ message: "Email already in use" });
    }

    // hash and create
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: { connect: { id: roleObj.id } }
      },
      select: { id: true, name: true, email: true, role: { select: { id: true, name: true } } }
    });

    console.log("[REGISTER] created user id:", user.id);
    return res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("[REGISTER] ERROR:", err);
    // Prisma duplicate error
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    // return stack in development so you can paste it here
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? String(err.stack || err) : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    // include role so user.role is defined
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    // determine role name safely
    const roleName = user.role?.name || "SalesExecutive";

    const payload = { id: user.id, email: user.email, role: roleName };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // create refresh token and persist session
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: { userId: user.id, refreshToken, expiresAt },
    });

    // send safe user object back (don't include password)
    res.json({
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: roleName },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

  const session = await prisma.session.findUnique({ where: { refreshToken } });
  if (!session || new Date(session.expiresAt) < new Date()) return res.status(401).json({ message: "Invalid or expired refresh token" });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { role: true } });
  const payload = { id: user.id, email: user.email, role: user.role.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ token });
};
