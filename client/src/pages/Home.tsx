import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <h1>안녕하세요, {user?.name}님</h1>
      <div className="home-grid">
        <Link to="/board/notice" className="home-card">
          <div className="home-card-title">공지게시판</div>
          <div className="home-card-desc">회사 공지사항을 확인하세요</div>
        </Link>
        <Link to="/board/free" className="home-card">
          <div className="home-card-title">자유게시판</div>
          <div className="home-card-desc">자유롭게 이야기를 나눠보세요</div>
        </Link>
        <Link to="/photos" className="home-card">
          <div className="home-card-title">사진게시판</div>
          <div className="home-card-desc">사진을 등록하고 공유하세요</div>
        </Link>
        {user?.role === "ADMIN" && (
          <Link to="/admin/users" className="home-card home-card-admin">
            <div className="home-card-title">회원 승인 관리</div>
            <div className="home-card-desc">가입 대기 중인 회원을 승인하세요</div>
          </Link>
        )}
      </div>
    </div>
  );
}
