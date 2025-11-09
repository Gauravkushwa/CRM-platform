import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getNotifications, markRead } from "../controllers/notificationController.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/:id/read", markRead);

export default router;
