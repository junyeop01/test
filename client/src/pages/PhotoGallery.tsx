import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface Photo {
  id: number;
  title: string | null;
  thumbPath: string;
  resizedPath: string;
  createdAt: string;
  uploader: { id: number; name: string };
}

export function PhotoGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Photo | null>(null);

  function load() {
    api
      .get("/photos")
      .then((res) => setPhotos(res.data.photos))
      .catch((err) => setError(errorMessage(err, "사진을 불러오지 못했습니다.")));
  }

  useEffect(load, []);

  async function handleDelete(id: number) {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/photos/${id}`);
      setSelected(null);
      load();
    } catch (err) {
      alert(errorMessage(err, "삭제에 실패했습니다."));
    }
  }

  return (
    <div className="photo-page">
      <div className="board-header">
        <h1>사진게시판</h1>
        <Link className="primary-btn" to="/photos/upload">
          사진 등록
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {photos.length === 0 && !error && <p className="empty-text">등록된 사진이 없습니다.</p>}

      <div className="photo-grid">
        {photos.map((photo) => (
          <button key={photo.id} className="photo-thumb" onClick={() => setSelected(photo)}>
            <img src={photo.thumbPath} alt={photo.title || "사진"} loading="lazy" />
          </button>
        ))}
      </div>

      {selected && (
        <div className="photo-modal" onClick={() => setSelected(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selected.resizedPath} alt={selected.title || "사진"} />
            <div className="photo-modal-meta">
              <div>
                <div>{selected.title || "(제목 없음)"}</div>
                <div className="post-list-meta">
                  {selected.uploader.name} · {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>
              {(user?.id === selected.uploader.id || user?.role === "ADMIN") && (
                <button className="danger-btn" onClick={() => handleDelete(selected.id)}>
                  삭제
                </button>
              )}
            </div>
            <button className="photo-modal-close" onClick={() => setSelected(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
