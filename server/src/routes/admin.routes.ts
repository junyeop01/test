import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const users = await prisma.user.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      department: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  res.json(users);
});

router.post("/users/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  res.json({ message: `${user.name}님을 승인했습니다.`, status: user.status });
});

router.post("/users/:id/reject", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  res.json({ message: `${user.name}님의 가입을 거절했습니다.`, status: user.status });
});

router.post("/users/:id/role", async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body ?? {};
  if (role !== "USER" && role !== "ADMIN") {
    return res.status(400).json({ message: "role은 USER 또는 ADMIN이어야 합니다." });
  }
  const user = await prisma.user.update({ where: { id }, data: { role } });
  res.json({ message: `${user.name}님의 권한을 ${role}로 변경했습니다.` });
});

export default router;
