import {useEffect, useState} from 'react'
import {getLessonsByLevel} from "../../services/LessonService";
import {Link, useParams} from "react-router-dom";
import "./Lessons.css"
const Lessons = () => {
  const {levelId} = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect (()  => {
    const LoadLessons = async () => {
      try {
        const data = await getLessonsByLevel(levelId);
        setLessons(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    LoadLessons();
  }, [levelId]);
  if (loading) {
    return <div>Đang tải bài học...</div>;
  }
  if (error) {
    return <div>Lỗi: {error}</div>;
  }

   return (
        <div className="lessons-page">

            <Link className="card-link" to="/hsk">
                ← HSK Levels
            </Link>

            <span
                className="eyebrow"
                style={{ display: "block", marginTop: 20 }}
            >
                HSK {levelId}
            </span>

            <h1 className="page-heading">
                Danh sách bài học
            </h1>

            <div className="lesson-banner surface-card">
                <h2>
                    HSK {levelId} - Bắt đầu học từng bước
                </h2>

                <p>
                    Mỗi bài học kết hợp từ vựng, ngữ pháp,
                    đọc hiểu và luyện tập.
                </p>
            </div>

            <div
                className="list-stack"
                style={{ marginTop: 14 }}
            >
                {lessons.map((lesson) => (
                    <div
                        className="surface-card lesson-row"
                        key={lesson.id}
                    >
                        <div className="lesson-main">

                            <span className="lesson-number">
                                {lesson.orderIndex}
                            </span>

                            <div>
                                <h3>
                                    Lesson {lesson.orderIndex} · {lesson.title}
                                </h3>

                                <p>
                                    Bài học HSK {levelId}
                                </p>
                            </div>

                        </div>

                        <Link
                            className="card-link"
                            to={`/hsk/${levelId}/lessons/${lesson.id}`}
                        >
                            Mở →
                        </Link>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default Lessons