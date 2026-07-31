import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  department: string | null;
  role: "USER" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

type Filter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export function AdminUsers() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/admin/users", { params: filter === "ALL" ? {} : { status: filter } })
      .then((res) => setUsers(res.data))
      .catch((err) => setError(errorMessage(err, "회원 목록을 불러오지 못했습니다.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function act(id: number, action: "approve" | "reject") {
    try {
      await api.post(`/admin/users/${id}/${action}`);
      load();
    } catch (err) {
      alert(errorMessage(err, "처리에 실패했습니다."));
    }
  }

  return (
    <div className="admin-page">
      <h1>회원 승인 관리</h1>
      <div className="filter-tabs">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as Filter[]).map((f) => (
          <button
            key={f}
            className={f === filter ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {{ PENDING: "승인대기", APPROVED: "승인됨", REJECTED: "거절됨", ALL: "전체" }[f]}
          </button>
        ))}
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && users.length === 0 && <p className="empty-text">대상 회원이 없습니다.</p>}

      <ul className="admin-user-list">
        {users.map((u) => (
          <li key={u.id} className="admin-user-item">
            <div>
              <div className="admin-user-name">
                {u.name} ({u.username})
              </div>
              <div className="post-list-meta">
                {u.email} {u.department ? `· ${u.department}` : ""} ·{" "}
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
              <div className={`status-badge status-${u.status.toLowerCase()}`}>{u.status}</div>
            </div>
            {u.status === "PENDING" && (
              <div className="admin-user-actions">
                <button className="primary-btn" onClick={() => act(u.id, "approve")}>
                  승인
                </button>
                <button className="danger-btn" onClick={() => act(u.id, "reject")}>
                  거절
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
