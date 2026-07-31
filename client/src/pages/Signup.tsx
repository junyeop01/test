import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";

export function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/auth/signup", form);
      navigate("/login", { state: { message: res.data.message } });
    } catch (err) {
      setError(errorMessage(err, "회원가입에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>회원가입</h1>
      <p className="hint-text">가입 후 관리자 승인이 완료되면 로그인할 수 있습니다.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          아이디
          <input value={form.username} onChange={update("username")} required />
        </label>
        <label>
          이메일
          <input type="email" value={form.email} onChange={update("email")} required />
        </label>
        <label>
          비밀번호 (8자 이상)
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            minLength={8}
            required
          />
        </label>
        <label>
          이름
          <input value={form.name} onChange={update("name")} required />
        </label>
        <label>
          부서 (선택)
          <input value={form.department} onChange={update("department")} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "가입하기"}
        </button>
      </form>
      <p className="auth-switch">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
