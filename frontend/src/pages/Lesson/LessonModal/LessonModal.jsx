
import { useEffect, useState } from "react";
import { getVocabulariesByLessonId } from "../../../services/VocabularyService";
import { canCreateLessonQuiz } from "../../../services/LessonQuiz";
import "./LessonModal.css";

const LessonModal = ({
  lesson,
  levelTitle,
  onClose,
  onStartStudy,
  onStartQuiz,
}) => {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let isActive = true;

    const loadVocabulary = async () => {
      if (!lesson?.id) {
        setVocabularies([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getVocabulariesByLessonId(lesson.id);

        if (isActive) {
          setVocabularies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Lỗi tải từ vựng:", err);

        if (isActive) {
          setError("Không thể tải danh sách từ vựng.");
          setVocabularies([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadVocabulary();

    return () => {
      isActive = false;
    };
  }, [lesson?.id]);

  const orderLabel = String(lesson?.orderIndex ?? 0).padStart(2, "0");
  const canTakeQuiz = canCreateLessonQuiz(vocabularies);

  return (
    <div className="lesson-modal-overlay" onClick={onClose}>
      <div
        className="lesson-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="lesson-modal-x"
          type="button"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>

        <header className="lesson-modal-head">
          <span className="lesson-modal-badge">{orderLabel}</span>
          <div>
            <p className="lesson-modal-eyebrow">{levelTitle}</p>
            <h2 id="lesson-modal-title">
              {lesson?.title ?? "Bài học"}
            </h2>
          </div>
        </header>

        <div className="lesson-modal-stages">
          <div className="lesson-stage is-active">
            <span className="lesson-stage-num">01</span>
            <div>
              <small>Giai đoạn 1</small>
              <strong>Phần học</strong>
              <small>
                {loading
                  ? "Đang tải..."
                  : error
                    ? "Chưa tải được"
                    : `${vocabularies.length} thẻ từ`}
              </small>
            </div>
          </div>

          <div className="lesson-stage">
            <span className="lesson-stage-num">02</span>
            <div>
              <small>Giai đoạn 2</small>
              <strong>Bài kiểm tra</strong>
              <small>
                {canTakeQuiz
                  ? `${vocabularies.length} câu · mỗi câu có 3 phần`
                  : "Cần ít nhất 4 từ và nghĩa khác nhau"}
              </small>
            </div>
          </div>
        </div>

        <div className="lesson-modal-status">
          <strong>Chưa làm bài</strong>
          <p>
            {error ||
              "Bạn có thể học flashcard trước hoặc làm bài kiểm tra ngay. Cần đạt ít nhất 80% để mở bài tiếp theo."}
          </p>
        </div>

        <footer className="lesson-modal-actions">
          <button
            className="lesson-btn-ghost"
            type="button"
            onClick={onClose}
          >
            Đóng
          </button>

          <button
            className="lesson-btn-ghost"
            type="button"
            onClick={onStartQuiz}
            disabled={loading || Boolean(error) || !canTakeQuiz}
          >
            Kiểm tra
          </button>

          <button
            className="lesson-btn-primary"
            type="button"
            onClick={onStartStudy}
            disabled={loading || Boolean(error) || vocabularies.length === 0}
          >
            Bắt đầu học <span aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LessonModal;
