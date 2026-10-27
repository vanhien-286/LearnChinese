import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHSKLevels } from "../../services/HSKLevelService";
import { getLessonsByLevel } from "../../services/LessonService";
import { getLessonProgress } from "../../services/LessonProgressService";
import LessonModal from "../Lesson/LessonModal/LessonModal";
import "./HSKLevels.css";

const HSKLevels = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [lessonResult, setLessonResult] = useState({
    levelId: null,
    lessons: [],
    error: "",
  });


  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [levelsError, setLevelsError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    const loadLevels = async () => {
      try {
        const data = await getHSKLevels();
        if (isCurrent) {
          setLevels(data);
          setSelectedLevelId(data[0]?.id ?? null);
        }
      } catch (error) {
        if (isCurrent) {
          setLevelsError(error.message || "Không thể tải danh sách HSK.");
        }
      } finally {
        if (isCurrent) {
          setLevelsLoading(false);
        }
      }
    };

    loadLevels();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (selectedLevelId === null) {
      return undefined;
    }

    let isCurrent = true;

    const loadLessons = async () => {
      try {
        const [data, progress] = await Promise.all([
          getLessonsByLevel(selectedLevelId),
          getLessonProgress(selectedLevelId),
        ]);
        if (isCurrent) {
          setLessonResult({ levelId: selectedLevelId, lessons: data, error: "" });
          setLessonProgress(progress);
        }
      } catch (error) {
        if (isCurrent) {
          setLessonProgress([]);
          setLessonResult({
            levelId: selectedLevelId,
            lessons: [],
            error: error.message || "Không thể tải danh sách bài học.",
          });
        }
      }
    };

    loadLessons();
    return () => {
      isCurrent = false;
    };
  }, [selectedLevelId]);

  const selectedLevel = levels.find(
    (level) => level.id === selectedLevelId,
  );
  const hasCurrentLessonResult = lessonResult.levelId === selectedLevelId;
  const lessons = hasCurrentLessonResult ? lessonResult.lessons : [];
  const lessonsError = hasCurrentLessonResult ? lessonResult.error : "";
  const lessonsLoading = selectedLevelId !== null && !hasCurrentLessonResult;

  if (levelsLoading) {
    return <div className="hsk-page-message">Đang tải danh sách HSK...</div>;
  }

  if (levelsError) {
    return <div className="hsk-page-message hsk-page-error">Lỗi: {levelsError}</div>;
  }

  return (
    <main className="hsk-levels-page">
      <header className="hsk-page-heading">
        <span className="hsk-eyebrow">LỘ TRÌNH HỌC TIẾNG TRUNG</span>
        <h1>Chọn cấp độ HSK</h1>
        <p>Chọn một cấp độ để khám phá các bài học trong lộ trình.</p>
      </header>

      <div className="hsk-learning-layout">
        <aside className="hsk-level-panel" aria-label="Các cấp độ HSK">
          <div className="hsk-level-panel-heading">
            <span className="hsk-eyebrow">LỘ TRÌNH HSK</span>
            <h2>Chọn cấp độ</h2>
            <p>{levels.length} cấp độ học</p>
          </div>

          <div className="hsk-level-list">
            {levels.map((level, index) => {
              const isSelected = level.id === selectedLevelId;

              return (
                <button
                  className={`hsk-level-option${isSelected ? " is-selected" : ""}`}
                  key={level.id}
                  type="button"
                  onClick={() => setSelectedLevelId(level.id)}
                  aria-pressed={isSelected}
                >
                  <span className="hsk-level-number">
                    {String(level.id ?? index + 1).padStart(2, "0")}
                  </span>
                  <span className="hsk-level-option-copy">
                    <strong>{level.title}</strong>
                    <span>{isSelected ? "Đang xem bài học" : "Chọn để xem bài học"}</span>
                  </span>
                  <span className="hsk-level-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="hsk-lessons-panel" aria-live="polite">
          {selectedLevel ? (
            <>
              <div className="hsk-lessons-heading">
                <div>
                  <span className="hsk-eyebrow">CHƯƠNG TRÌNH HỌC</span>
                  <h2>{selectedLevel.title}</h2>
                  <p>
                    {lessons.length} {lessons.length === 1 ? "bài học" : "bài học"} trong cấp độ này
                  </p>
                </div>
                <span className="hsk-lessons-badge">
                  HSK {String(selectedLevel.id).padStart(2, "0")}
                </span>
              </div>

              {lessonsLoading ? (
                <div className="hsk-content-message">Đang tải bài học...</div>
              ) : lessonsError ? (
                <div className="hsk-content-message hsk-page-error">
                  Lỗi: {lessonsError}
                </div>
              ) : lessons.length === 0 ? (
                <div className="hsk-content-message">
                  Chưa có bài học nào cho cấp độ này.
                </div>
              ) : (
                <div className="hsk-lesson-list">
                  {lessons.map((lesson, index) => {
                    const progress = lessonProgress.find(
                      (item) => item.lessonId === lesson.id,
                    );
                    const isCompleted = progress?.isCompleted ?? false;
                    const isLocked =
                      index > 0 &&
                      !lessonProgress.some(
                        (progress) =>
                          progress.lessonId === lessons[index - 1].id &&
                          progress.isCompleted,
                      );

                    return (
                    <article className="hsk-lesson-card" key={lesson.id}>
                      <span className="hsk-lesson-number">
                        {String(lesson.orderIndex).padStart(2, "0")}
                      </span>
                      <div className="hsk-lesson-copy">
                        <span className="hsk-lesson-kicker">
                          BÀI HỌC {String(lesson.orderIndex).padStart(2, "0")}
                        </span>
                        <h3>{lesson.title}</h3>
                        <p>
                          {lesson.description || `Bài học ${selectedLevel.title}, học theo từng bước.`}
                        </p>
                        {isLocked ? (
                          <span className="hsk-lesson-status">
                            Đạt ít nhất 80% bài trước để mở bài này
                          </span>
                        ) : isCompleted ? (
                          <span className="hsk-lesson-status is-completed">
                            Đã hoàn thành
                          </span>
                        ) : progress ? (
                          <span className="hsk-lesson-status">
                            Chưa đạt 80% · hãy thử lại
                          </span>
                        ) : null}
                      </div>
                      <button
                        className={`hsk-lesson-link${isLocked ? " is-locked" : ""}`}
                        type="button"
                        disabled={isLocked}
                        onClick={() => setActiveLesson(lesson)}
                      >
                        {isLocked ? "Đang khóa" : "Vào học"}
                        <span aria-hidden="true">→</span>
                      </button>
                    </article>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="hsk-content-message">
              Chưa có cấp độ HSK nào để hiển thị.
            </div>
          )}
        </section>
      </div>

        {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          levelTitle={selectedLevel?.title}
          onClose={() => setActiveLesson(null)}
          onStartStudy={() => {
            setActiveLesson(null);
            navigate(`/hsk/${selectedLevel.id}/lessons/${activeLesson.id}`);
          }}
          onStartQuiz={() => {
            setActiveLesson(null);
            navigate(
              `/hsk/${selectedLevel.id}/lessons/${activeLesson.id}?mode=quiz`,
            );
          }}
        />
      )}
    </main>
  );
};

export default HSKLevels;
