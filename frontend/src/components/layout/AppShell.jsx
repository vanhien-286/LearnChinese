import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getUserProfile } from "../../services/UserService";
import "./AppShell.css";

const AppShell = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error("Lỗi khi tải profile:", error);

        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return <div className="app-loading">Đang tải...</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <NavLink to="/dashboard" className="brand-title">
            汉语学习
          </NavLink>
          <small>Học tiếng Trung từng bước</small>
        </div>

        <nav className="nav-list">
          <NavLink className="nav-link" to="/dashboard">
            <span>⌂</span>
            Trang chủ
          </NavLink>
          <NavLink className="nav-link" to="/hsk">
            <span>📚</span>
            Lộ trình
          </NavLink>
        </nav>

        <div className="profile-wrapper">
          <button
            className="profile-chip"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="profile-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </span>
            <span>{user?.username || "Người dùng"}</span>
            <span className="profile-arrow">
              {showProfileMenu ? "▲" : "▼"}
            </span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <strong>{user?.username}</strong>
                <small>{user?.email}</small>
              </div>

              <div className="profile-menu-divider" />

              <button onClick={() => setShowProfileMenu(false)}>
                Hồ sơ
              </button>

              <button onClick={() => setShowProfileMenu(false)}>
                Cài đặt
              </button>

              <div className="profile-menu-divider" />

              <button className="logout-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="main-area">
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;