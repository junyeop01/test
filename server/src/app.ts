import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import postsRoutes from "./routes/posts.routes";
import photosRoutes from "./routes/photos.routes";
import { ensureUploadDirs } from "./utils/imageResize";

ensureUploadDirs();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
app.use("/uploads", express.static(uploadDir));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/photos", photosRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).send("Client build not found. Run the client build first.");
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || "서버 오류가 발생했습니다." });
});

export default app;
