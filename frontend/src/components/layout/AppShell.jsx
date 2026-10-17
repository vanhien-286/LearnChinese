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

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* LOGO */}
        <div className="brand">
          <NavLink to="/dashboard" className="brand-title">
            汉语学习
          </NavLink>

          <small>
            Học tiếng Trung từng bước
          </small>
        </div>


        {/* NAVIGATION */}
        <nav className="nav-list">

          {/* HỌC TẬP */}
          <div className="nav-section-title">
            HỌC TẬP
          </div>

          <NavLink
            className="nav-link"
            to="/dashboard"
          >
            <span>⌂</span>
            Trang chủ
          </NavLink>


          <NavLink
            className="nav-link"
            to="/hsk"
          >
            <span>📚</span>
            HSK
          </NavLink>


          <NavLink
            className="nav-link"
            to="/chat"
          >
            <span>💬</span>
            Trò chuyện
          </NavLink>


          <NavLink
            className="nav-link"
            to="/videos"
          >
            <span>🎬</span>
            Video
          </NavLink>


          <NavLink
            className="nav-link"
            to="/listening"
          >
            <span>🎧</span>
            Nghe
          </NavLink>


          {/* KHÁC */}
          <div className="nav-section-title">
            KHÁC
          </div>


          <NavLink
            className="nav-link"
            to="/progress"
          >
            <span>📊</span>
            Tiến độ
          </NavLink>


          <NavLink
            className="nav-link"
            to="/settings"
          >
            <span>⚙</span>
            Cài đặt
          </NavLink>

        </nav>


        {/* USER AREA */}
        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="sidebar-user-info">

            <strong>
              {user?.username || "Người dùng"}
            </strong>

            <small>
              {user?.role || "User"}
            </small>

          </div>

        </div>

      </aside>
      <div className="main-area">


        {/* TOPBAR */}
        <header className="topbar">

          <div className="topbar-title">
            Không gian học của bạn
          </div>


          {/* PROFILE */}
          <div className="profile-wrapper">

            <button
              className="profile-chip"
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
            >

              <span className="profile-avatar">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span>
                {user?.username || "Người dùng"}
              </span>

              <span className="profile-arrow">
                {showProfileMenu ? "▲" : "▼"}
              </span>

            </button>


            {/* PROFILE MENU */}
            {showProfileMenu && (

              <div className="profile-menu">

                <div className="profile-menu-header">

                  <strong>
                    {user?.username}
                  </strong>

                  <small>
                    {user?.email}
                  </small>

                </div>


                <div className="profile-menu-divider" />


                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                  }}
                >
                  Hồ sơ
                </button>


                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                  }}
                >
                  Cài đặt
                </button>


                <div className="profile-menu-divider" />


                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>

              </div>

            )}

          </div>

        </header>


        {/* PAGE CONTENT */}
        <main className="page-container">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AppShell;