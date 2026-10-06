
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLessonById } from "../../services/LessonService";
import { getVocabulariesByLessonId } from "../../services/VocabularyService";
import "./Lesson.css"
const Lesson = () => {
    const { levelId, lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [vocabularies, setVocabularies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [vocabularyLoading, setVocabularyLoading] = useState(false);
    const [error, setError] = useState("");
    const [vocabularyError, setVocabularyError] = useState("");

    const [activeTab, setActiveTab] = useState("vocabulary");

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getLessonById(lessonId);
                setLesson(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    useEffect(() => {
        const fetchVocabularies = async () => {
            try {
                setVocabularyLoading(true);
                setVocabularyError("");

                const data = await getVocabulariesByLessonId(lessonId);
                setVocabularies(data);
            } catch (err) {
                setVocabularyError(err.message);
            } finally {
                setVocabularyLoading(false);
            }
        };

        fetchVocabularies();
    }, [lessonId]);

    if (loading) {
        return <div>Đang tải bài học...</div>;
    }

    if (error) {
        return <div>Lỗi: {error}</div>;
    }

    if (!lesson) {
        return <div>Không tìm thấy bài học.</div>;
    }

    return (
        <div className="page-content">
            <button onClick={() => navigate(-1)}>
                ← Quay lại
            </button>

            <div>
                <span>HSK {levelId}</span>
                <h1>Lesson {lesson.orderIndex}</h1>
                <h2>{lesson.title}</h2>
                {lesson.description && <p>{lesson.description}</p>}
            </div>

            <div className="lesson-tabs">
                <button
                    className={activeTab === "vocabulary" ? "active" : ""}
                    onClick={() => setActiveTab("vocabulary")}
                >
                    Vocabulary
                </button>

                <button
                    className={activeTab === "grammar" ? "active" : ""}
                    onClick={() => setActiveTab("grammar")}
                >
                    Grammar
                </button>

                <button
                    className={activeTab === "reading" ? "active" : ""}
                    onClick={() => setActiveTab("reading")}
                >
                    Reading
                </button>

                <button
                    className={activeTab === "practice" ? "active" : ""}
                    onClick={() => setActiveTab("practice")}
                >
                    Practice
                </button>
            </div>

            <div className="lesson-content">
                {activeTab === "vocabulary" && (
                    <div>
                        <h2>Từ vựng</h2>
                        <p>
                            Danh sách từ vựng của bài học này.
                        </p>

                        {vocabularyLoading ? (
                            <p>Đang tải từ vựng...</p>
                        ) : vocabularyError ? (
                            <p>Lỗi: {vocabularyError}</p>
                        ) : vocabularies.length === 0 ? (
                            <p>Bài học chưa có từ vựng.</p>
                        ) : (
                            <div className="vocabulary-list">
                    {vocabularies.map((vocabulary) => (
                        <div
                            className="vocabulary-card"
                            key={vocabulary.id}
                            onClick={() => navigate(`/vocabulary/${vocabulary.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    navigate(`/vocabulary/${vocabulary.id}`);
                                }
                            }}
                        >
                                        <h3>{vocabulary.wordSimplified}</h3>

                                        {vocabulary.wordTraditional && (
                                            <p>
                                                Phồn thể: {vocabulary.wordTraditional}
                                            </p>
                                        )}

                                        <p>
                                            Pinyin: {vocabulary.pinyin}
                                        </p>

                                        <p>
                                            Từ loại: {vocabulary.partOfSpeech || "Chưa cập nhật"}
                                        </p>

                                        <p>
                                            Nghĩa: {vocabulary.meaning || "Chưa cập nhật"}
                                        </p>
                                    </div>
                                    
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "grammar" && (
                    <div>
                        <h2>Ngữ pháp</h2>
                        <p>Phần ngữ pháp sẽ được phát triển tiếp.</p>
                    </div>
                )}

                {activeTab === "reading" && (
                    <div>
                        <h2>Đọc hiểu</h2>
                        <p>Phần đọc hiểu sẽ được phát triển tiếp.</p>
                    </div>
                )}

                {activeTab === "practice" && (
                    <div>
                        <h2>Luyện tập</h2>
                        <p>Phần luyện tập sẽ được phát triển tiếp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lesson;