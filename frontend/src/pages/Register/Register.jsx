import { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { RegisterUser } from "../../services/UserService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validation = () => {
    if (!email || !username || !password) {
      alert("Vui lòng điền đầy đủ thông tin");
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
      alert("Email không hợp lệ");
      return false;
    }

    return true;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!validation()) return;

    setLoading(true);
    try {
      await RegisterUser({ email, username, password });
      
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");

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
        <div className="auth-visual-copy"><strong>从今天开始学习</strong><span>Bắt đầu hành trình của bạn hôm nay</span></div>
      </section>
      <form className="login-form" onSubmit={handleSubmit}>
        <button type="button" className="back-btn" onClick={() => navigate("/")}>← Quay lại</button>
        <span className="auth-kicker">Tạo không gian học của bạn</span>
        <h2>Đăng ký tài khoản</h2>
        <p className="auth-description">Lưu tiến độ học và tiếp tục trên mọi thiết bị.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <button
          type="button"
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default Register;