import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  res.json(notifications);
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  await prisma.notification.update({ where: { id: Number(id) }, data: { isRead: true } });
  res.json({ success: true });
};
