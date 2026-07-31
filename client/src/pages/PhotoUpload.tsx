import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";

export function PhotoUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("사진 파일을 선택해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      if (title) formData.append("title", title);
      await api.post("/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/photos");
    } catch (err) {
      setError(errorMessage(err, "업로드에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="photo-upload-page">
      <h1>사진 등록</h1>
      <p className="hint-text">등록한 사진은 서버에서 자동으로 리사이징되어 저장됩니다.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          사진 선택
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </label>
        {preview && <img src={preview} alt="미리보기" className="upload-preview" />}
        <label>
          제목 (선택)
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "업로드 중..." : "등록"}
        </button>
      </form>
    </div>
  );
}
