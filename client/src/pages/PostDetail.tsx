import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface PostDetailData {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  author: { id: number; name: string; department: string | null };
}

export function PostDetail() {
  const { boardType = "free", id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => setError(errorMessage(err, "게시글을 불러오지 못했습니다.")));
  }, [id]);

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate(`/board/${boardType}`);
    } catch (err) {
      alert(errorMessage(err, "삭제에 실패했습니다."));
    }
  }

  if (error) return <p className="error-text">{error}</p>;
  if (!post) return <p>불러오는 중...</p>;

  const canManage = user?.id === post.author.id || user?.role === "ADMIN";

  return (
    <div className="post-detail-page">
      <Link className="back-link" to={`/board/${boardType}`}>
        ← 목록으로
      </Link>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>
          {post.author.name}
          {post.author.department ? ` · ${post.author.department}` : ""}
        </span>
        <span>
          조회 {post.viewCount} · {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="post-content">{post.content}</div>

      {canManage && (
        <div className="post-actions">
          <Link to={`/board/${boardType}/${post.id}/edit`} className="secondary-btn">
            수정
          </Link>
          <button className="danger-btn" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
