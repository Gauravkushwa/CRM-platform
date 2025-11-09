import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addActivity } from "../controllers/activityController.js";

const router = express.Router();
router.post("/", authMiddleware, addActivity);

export default router;
