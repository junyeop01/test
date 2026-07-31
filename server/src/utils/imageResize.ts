import path from "path";
import fs from "fs";
import sharp from "sharp";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");
export const ORIGINAL_DIR = path.join(UPLOAD_DIR, "original");
export const RESIZED_DIR = path.join(UPLOAD_DIR, "resized");
export const THUMB_DIR = path.join(UPLOAD_DIR, "thumb");

export function ensureUploadDirs() {
  for (const dir of [ORIGINAL_DIR, RESIZED_DIR, THUMB_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const RESIZED_MAX_WIDTH = 1600;
const THUMB_WIDTH = 320;

export interface ProcessedImage {
  originalPath: string;
  resizedPath: string;
  thumbPath: string;
  width: number;
  height: number;
}

export async function processUploadedImage(
  sourcePath: string,
  filenameBase: string
): Promise<ProcessedImage> {
  const ext = ".jpg";
  const originalFilename = `${filenameBase}${path.extname(sourcePath) || ext}`;
  const resizedFilename = `${filenameBase}${ext}`;
  const thumbFilename = `${filenameBase}${ext}`;

  const originalDest = path.join(ORIGINAL_DIR, originalFilename);
  const resizedDest = path.join(RESIZED_DIR, resizedFilename);
  const thumbDest = path.join(THUMB_DIR, thumbFilename);

  fs.copyFileSync(sourcePath, originalDest);

  const image = sharp(sourcePath).rotate();
  const metadata = await image.metadata();

  await sharp(sourcePath)
    .rotate()
    .resize({ width: RESIZED_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(resizedDest);

  await sharp(sourcePath)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbDest);

  return {
    originalPath: `/uploads/original/${originalFilename}`,
    resizedPath: `/uploads/resized/${resizedFilename}`,
    thumbPath: `/uploads/thumb/${thumbFilename}`,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
