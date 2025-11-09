import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createLead, getLeads, getLeadById, updateLead, deleteLead } from "../controllers/leadController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
