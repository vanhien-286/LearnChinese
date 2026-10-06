import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../services/UserService";
import "./Dashboard.css";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const LoadProfile = async () => {
      try {
        const data = await getUserProfile();

        setUser(data);
      } catch (error) {
        console.error("lỗi", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    LoadProfile();
  }, [navigate]);

  if (loading) {
    return <div>Đang tải...</div>;
  }
return ( 
  <div className="page-content">
    <div className="dashboard-heading">
      <div><span className="eyebrow">Dashboard</span><h1 className="page-heading">
        Xin chào, { user?.username || "Người dùng"}!
        </h1>
        <p className="page-intro">Cùng chinh phục HSK và mỗi ngày tiến bộ một chút nhé.</p></div>
      <Link className="primary-button" to="/hsk/1/lessons/2">Tiếp tục học</Link>
    </div>

    <div className="learning-overview surface-card">
      <div><span className="eyebrow">Tiến độ tổng thể</span><h2>Giữ nhịp học đều đặn</h2><p>Hoàn thành thêm một bài hôm nay để duy trì thói quen.</p></div>
      <div className="progress-ring"><strong>0%</strong><span>Hoàn thành</span></div>
    </div>

    <h2 className="section-heading">Tiến độ của bạn</h2>
    <div className="stats-grid">
      <div className="surface-card stat-card"><div className="stat-number">0</div><div className="stat-label">Bài học hoàn thành</div></div>
      <div className="surface-card stat-card"><div className="stat-number">0</div><div className="stat-label">Từ đã ghi nhớ</div></div>
      <div className="surface-card stat-card"><div className="stat-number">0 ngày</div><div className="stat-label">Chuỗi học liên tiếp</div></div>
    </div>

    <div className="section-heading-row"><h2 className="section-heading">Khóa học của bạn</h2><Link className="card-link" to="/hsk">Xem tất cả</Link></div>
    <div className="level-mini-grid">
      {[1, 2, 3, 4].map((level) => 
      <Link className={`level-mini level-${level}`} to={`/hsk/${level}/lessons`} key={level}>
        <span className="level-symbol">HSK</span>
        <h3>HSK {level}</h3>
        <p>{level === 1 ? "300 từ vựng" : "Đang chuẩn bị"}</p>
        <div className="progress-track">
          <div className="progress-value" style={{ width: "0%" }} />
          </div>
          <span className="level-action">{level === 1 ? "Tiếp tục học" : "Bắt đầu"}
            </span></Link>)}
    </div>
  </div>
)
};

  

export default Dashboard;