import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface PostSummary {
  id: number;
  title: string;
  viewCount: number;
  createdAt: string;
  author: { id: number; name: string; department: string | null };
}

const TITLES: Record<string, string> = {
  free: "자유게시판",
  notice: "공지게시판",
};

export function BoardList() {
  const { boardType = "free" } = useParams();
  const apiBoardType = boardType.toUpperCase();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/posts", { params: { boardType: apiBoardType } })
      .then((res) => setPosts(res.data.posts))
      .catch((err) => setError(errorMessage(err, "게시글을 불러오지 못했습니다.")))
      .finally(() => setLoading(false));
  }, [apiBoardType]);

  const canWrite = apiBoardType === "FREE" || user?.role === "ADMIN";

  return (
    <div className="board-page">
      <div className="board-header">
        <h1>{TITLES[boardType] || "게시판"}</h1>
        {canWrite && (
          <Link className="primary-btn" to={`/board/${boardType}/write`}>
            글쓰기
          </Link>
        )}
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && posts.length === 0 && <p className="empty-text">게시글이 없습니다.</p>}

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/board/${boardType}/${post.id}`} className="post-list-item">
              <span className="post-list-title">{post.title}</span>
              <span className="post-list-meta">
                {post.author.name} · 조회 {post.viewCount} ·{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
