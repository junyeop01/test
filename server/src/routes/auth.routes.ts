import { Router } from "express";
import { prisma } from "../prismaClient";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", async (req, res) => {
  const { username, email, password, name, department } = req.body ?? {};

  if (!username || !email || !password || !name) {
    return res.status(400).json({ message: "필수 항목을 모두 입력해주세요." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return res.status(409).json({ message: "이미 사용 중인 아이디 또는 이메일입니다." });
  }

  const userCount = await prisma.user.count();
  const isFirstUser = userCount === 0;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: await hashPassword(password),
      name,
      department: department || null,
      role: isFirstUser ? "ADMIN" : "USER",
      status: isFirstUser ? "APPROVED" : "PENDING",
    },
  });

  res.status(201).json({
    message: isFirstUser
      ? "최초 가입자는 관리자 계정으로 자동 승인되었습니다. 로그인해주세요."
      : "회원가입이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
    status: user.status,
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  if (user.status === "PENDING") {
    return res.status(403).json({ message: "관리자 승인 대기 중입니다.", status: "PENDING" });
  }
  if (user.status === "REJECTED") {
    return res.status(403).json({ message: "가입이 거절된 계정입니다.", status: "REJECTED" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    department: user.department,
    role: user.role,
    status: user.status,
  });
});

export default router;
