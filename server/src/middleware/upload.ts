import multer from "multer";
import path from "path";
import os from "os";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const upload = multer({
  dest: path.join(os.tmpdir(), "webview-app-uploads"),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new Error("지원하지 않는 이미지 형식입니다."));
      return;
    }
    cb(null, true);
  },
});
