import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";

const TITLES: Record<string, string> = {
  free: "자유게시판",
  notice: "공지게시판",
};

export function PostEdit() {
  const { boardType = "free", id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/posts/${id}`).then((res) => {
      setTitle(res.data.title);
      setContent(res.data.content);
    });
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, { title, content });
        navigate(`/board/${boardType}/${id}`);
      } else {
        const res = await api.post("/posts", {
          boardType: boardType.toUpperCase(),
          title,
          content,
        });
        navigate(`/board/${boardType}/${res.data.id}`);
      }
    } catch (err) {
      setError(errorMessage(err, "저장에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="post-edit-page">
      <h1>
        {TITLES[boardType] || "게시판"} {isEdit ? "수정" : "글쓰기"}
      </h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          내용
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
