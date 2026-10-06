import { useEffect,useState  } from "react";
import {  useNavigate } from "react-router-dom";
import { getHSKLevels } from "../../services/HSKLevelService"; 
import "./HSKLevels.css";

const HSKLevels = () => {

const [levels, setLevers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);

const navigate = useNavigate();

useEffect(() => {
  
  const loadLevel = async () => {
    setLoading(true);
    try {
      
      const data = await getHSKLevels();
      setLevers(data); 
    }
    catch (error) {
      console.error("Lỗi khi tải HSK:", error);
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  };
  loadLevel();
}, []);
if (loading) {
  return <div>Đang tải danh sách HSK...</div>;
}
if (error) {
  return <div>Lỗi: {error}</div>;
}
return (
  <div className="page-content">
    <h1>
      cấp độ HSK
    </h1>
    <div>
      {levels.map((level) => (
        <div key={level.id}>
          <h2>{level.title}</h2>
          <button onClick={() => navigate(`/hsk/${level.id}/lessons`) }>
              Xem bài học
          </button>
        </div>
      ))}

    </div>

  </div>
)
};

export default HSKLevels;