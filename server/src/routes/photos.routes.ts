import { Router } from "express";
import fs from "fs";
import crypto from "crypto";
import { prisma } from "../prismaClient";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { processUploadedImage } from "../utils/imageResize";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = 24;

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { uploader: { select: { id: true, name: true, department: true } } },
    }),
    prisma.photo.count(),
  ]);

  res.json({ photos, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true, department: true } } },
  });
  if (!photo) return res.status(404).json({ message: "사진을 찾을 수 없습니다." });
  res.json(photo);
});

router.post("/", upload.single("photo"), async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "업로드할 사진 파일이 필요합니다." });
  }

  try {
    const filenameBase = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const processed = await processUploadedImage(file.path, filenameBase);

    const photo = await prisma.photo.create({
      data: {
        title: typeof req.body?.title === "string" ? req.body.title : null,
        originalPath: processed.originalPath,
        resizedPath: processed.resizedPath,
        thumbPath: processed.thumbPath,
        width: processed.width,
        height: processed.height,
        uploaderId: req.user!.userId,
      },
      include: { uploader: { select: { id: true, name: true, department: true } } },
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "이미지 처리 중 오류가 발생했습니다." });
  } finally {
    fs.unlink(file.path, () => {});
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return res.status(404).json({ message: "사진을 찾을 수 없습니다." });
  if (photo.uploaderId !== req.user!.userId && req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "삭제 권한이 없습니다." });
  }

  await prisma.photo.delete({ where: { id } });
  res.status(204).send();
});

export default router;
