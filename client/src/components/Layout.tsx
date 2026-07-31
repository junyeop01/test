import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">사내 게시판</div>
        {user && (
          <div className="app-user">
            <span>{user.name}님</span>
            <button className="link-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      {user && (
        <nav className="bottom-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            홈
          </NavLink>
          <NavLink to="/board/notice" className={({ isActive }) => (isActive ? "active" : "")}>
            공지
          </NavLink>
          <NavLink to="/board/free" className={({ isActive }) => (isActive ? "active" : "")}>
            자유게시판
          </NavLink>
          <NavLink to="/photos" className={({ isActive }) => (isActive ? "active" : "")}>
            사진
          </NavLink>
          {user.role === "ADMIN" && (
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
              관리자
            </NavLink>
          )}
        </nav>
      )}
    </div>
  );
}
