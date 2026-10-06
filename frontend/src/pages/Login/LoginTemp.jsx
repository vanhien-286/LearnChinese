import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../services/UserService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validation = () => {
    if (!email || !password) {
      alert("Vui lòng điền đầy đủ thông tin");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validation()) return;
    setLoading(true);

    try {
      const data = await LoginUser({ email, password });
      localStorage.setItem("token", data.token);
      alert("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">HSK Learn <small>Học tiếng Trung dễ dàng hơn</small></div>
        <div className="auth-visual-copy"><strong>每天进步一点点</strong><span>Mỗi ngày tiến bộ một chút</span></div>
      </section>
      <form className="login-form" onSubmit={handleSubmit}>
        <button type="button" className="back-btn" onClick={() => navigate("/")}>← Quay lại</button>
        <span className="auth-kicker">Chào mừng bạn quay lại</span>
        <h2>Đăng nhập</h2>
        <p className="auth-description">Hãy đăng nhập để tiếp tục hành trình học HSK.</p>

        <input
          type="email"
          placeholder="Email đăng nhập"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="show-password-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        </button>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/register")}
        >
          Chưa có tài khoản? Đăng ký ngay
        </button>
      </form>
    </div>
  );
};

export default Login;