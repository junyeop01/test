import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

function parseBoardType(value: unknown): "FREE" | "NOTICE" | null {
  return value === "FREE" || value === "NOTICE" ? value : null;
}

router.get("/", async (req, res) => {
  const boardType = parseBoardType(req.query.boardType);
  if (!boardType) {
    return res.status(400).json({ message: "boardType은 FREE 또는 NOTICE 여야 합니다." });
  }
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = 20;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { boardType },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { id: true, name: true, department: true } } },
    }),
    prisma.post.count({ where: { boardType } }),
  ]);

  res.json({ posts, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: { author: { select: { id: true, name: true, department: true } } },
  }).catch(() => null);

  if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  res.json(post);
});

router.post("/", async (req: AuthRequest, res) => {
  const boardType = parseBoardType(req.body?.boardType);
  const { title, content } = req.body ?? {};

  if (!boardType) {
    return res.status(400).json({ message: "boardType은 FREE 또는 NOTICE 여야 합니다." });
  }
  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
  }
  if (boardType === "NOTICE" && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "공지사항은 관리자만 작성할 수 있습니다." });
  }

  const post = await prisma.post.create({
    data: { boardType, title, content, authorId: req.user!.userId },
    include: { author: { select: { id: true, name: true, department: true } } },
  });
  res.status(201).json(post);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  if (post.authorId !== req.user!.userId && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "수정 권한이 없습니다." });
  }

  const { title, content } = req.body ?? {};
  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { title, content },
    include: { author: { select: { id: true, name: true, department: true } } },
  });
  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  if (post.authorId !== req.user!.userId && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "삭제 권한이 없습니다." });
  }

  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

export default router;
