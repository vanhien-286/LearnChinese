import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getVocabulariesByLessonId } from "../../services/VocabularyService";
import { getLessonById, getLessonsByLevel } from "../../services/LessonService";
import {
  getLessonProgress,
  saveLessonResult,
} from "../../services/LessonProgressService";
import {
  canCreateLessonQuiz,
  createLessonQuiz,
  normalizePinyin,
} from "../../services/LessonQuiz";
import "./Lesson.css";

const Lesson = () => {
  const { levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lesson, setLesson] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [levelLessons, setLevelLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [stage, setStage] = useState("study");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState({
    meaning: "",
    word: "",
    pinyin: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError("");

        const [lessonData, vocabularyData, lessonsData, progress] = await Promise.all([
          getLessonById(lessonId),
          getVocabulariesByLessonId(lessonId),
          getLessonsByLevel(levelId),
          getLessonProgress(levelId),
        ]);

        if (!isCurrent) {
          return;
        }

        const currentIndex = lessonsData.findIndex(
          (item) => item.id === Number(lessonId),
        );
        if (currentIndex === -1) {
          throw new Error("Bài học không thuộc cấp độ HSK đã chọn.");
        }

        const previousLesson = lessonsData[currentIndex - 1];
        setIsLocked(
          Boolean(
            previousLesson &&
              !progress.some(
                (item) =>
                  item.lessonId === previousLesson.id && item.isCompleted,
              ),
          ),
        );
        setLesson(lessonData);
        setVocabularies(vocabularyData);
        setLevelLessons(lessonsData);

        if (searchParams.get("mode") === "quiz") {
          const quizQuestions = createLessonQuiz(vocabularyData);
          if (quizQuestions.length > 0) {
            setQuestions(quizQuestions);
            setStage("quiz");
          }
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message || "Không thể tải bài học.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadLesson();
    return () => {
      isCurrent = false;
    };
  }, [levelId, lessonId, searchParams]);

  const startQuiz = () => {
    setQuestions(createLessonQuiz(vocabularies));
    setQuestionIndex(0);
    setAnswer({ meaning: "", word: "", pinyin: "" });
    setIsSubmitted(false);
    setQuizAnswers([]);
    setResult(null);
    setSaveError("");
    setStage("quiz");
  };

  const saveQuizResult = async (answers) => {
    try {
      setSaveError("");
      const savedResult = await saveLessonResult(lessonId, answers);
      setResult({
        score: savedResult.score,
        passed: savedResult.passed,
        completed: savedResult.isCompleted,
        correctAnswers: savedResult.correctAnswers,
      });
      setStage("result");
    } catch (saveError) {
      setSaveError(saveError.message || "Không thể lưu kết quả bài học.");
    }
  };

  const submitAnswer = async () => {
    if (
      !answer.meaning ||
      !answer.word ||
      !answer.pinyin.trim() ||
      isSubmitted
    ) {
      return;
    }

    const question = questions[questionIndex];
    const updatedAnswers = [
      ...quizAnswers,
      {
        vocabularyId: question.vocabulary.id,
        meaning: answer.meaning,
        word: answer.word,
        pinyin: answer.pinyin,
      },
    ];

    setQuizAnswers(updatedAnswers);
    setIsSubmitted(true);

    if (questionIndex === questions.length - 1) {
      await saveQuizResult(updatedAnswers);
    }
  };

  const goToNextQuestion = () => {
    setQuestionIndex((index) => index + 1);
    setAnswer({ meaning: "", word: "", pinyin: "" });
    setIsSubmitted(false);
    setSaveError("");
  };

  if (loading) {
    return <div className="lesson-page-message">Đang tải bài học...</div>;
  }

  if (error) {
    return <div className="lesson-page-message lesson-page-error">Lỗi: {error}</div>;
  }

  if (isLocked) {
    return (
      <main className="lesson-page">
        <button className="lesson-back-button" onClick={() => navigate("/hsk")}>
          ← Danh sách bài học
        </button>
        <section className="lesson-message-card">
          <h1>Bài học đang bị khóa</h1>
          <p>Hãy hoàn thành bài kiểm tra trước với điểm số từ 80% trở lên.</p>
        </section>
      </main>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <main className="lesson-page">
        <section className="lesson-message-card">
          <h1>{lesson.title}</h1>
          <p>Bài học này chưa có từ vựng để học hoặc kiểm tra.</p>
        </section>
      </main>
    );
  }

  const currentCard = vocabularies[cardIndex];
  const currentQuestion = questions[questionIndex];
  const currentLessonIndex = levelLessons.findIndex(
    (item) => item.id === Number(lessonId),
  );
  const nextLesson = levelLessons[currentLessonIndex + 1];
  const canTakeQuiz = canCreateLessonQuiz(vocabularies);

  return (
    <main className="lesson-page">
      <button className="lesson-back-button" onClick={() => navigate("/hsk")}>
        ← Danh sách bài học
      </button>

      <header className="lesson-page-heading">
        <span>BÀI HỌC {String(lesson.orderIndex).padStart(2, "0")}</span>
        <h1>{lesson.title}</h1>
        <p>
          {stage === "study"
            ? `Thẻ ${cardIndex + 1} / ${vocabularies.length}`
            : stage === "quiz"
              ? `Câu ${questionIndex + 1} / ${questions.length}`
              : "Kết quả bài kiểm tra"}
        </p>
      </header>

      {stage === "study" && (
        <section className="lesson-study">
          <button
            className={`lesson-flashcard${isFlipped ? " is-flipped" : ""}`}
            type="button"
            onClick={() => setIsFlipped((flipped) => !flipped)}
            aria-label={isFlipped ? "Ẩn nghĩa của từ" : "Lật thẻ xem nghĩa"}
          >
            {isFlipped ? (
              <>
                <span className="lesson-card-label">NGHĨA</span>
                <strong>{currentCard.meaning}</strong>
                <span>{currentCard.pinyin}</span>
              </>
            ) : (
              <>
                <span className="lesson-card-label">TỪ TIẾNG TRUNG</span>
                <strong lang="zh">{currentCard.wordSimplified}</strong>
                <span>Chạm để lật thẻ</span>
              </>
            )}
          </button>

          <div className="lesson-study-actions">
            <button
              type="button"
              onClick={() => {
                setCardIndex((index) => index - 1);
                setIsFlipped(false);
              }}
              disabled={cardIndex === 0}
            >
              ← Thẻ trước
            </button>
            <button
              type="button"
              onClick={() => {
                if (cardIndex === vocabularies.length - 1) {
                  startQuiz();
                } else {
                  setCardIndex((index) => index + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={
                !isFlipped ||
                (cardIndex === vocabularies.length - 1 && !canTakeQuiz)
              }
            >
              {cardIndex === vocabularies.length - 1
                ? "Bắt đầu kiểm tra →"
                : "Thẻ tiếp theo →"}
            </button>
          </div>
          {!isFlipped && (
            <p className="lesson-help-text">
              Lật thẻ để xem nghĩa trước khi chuyển sang thẻ tiếp theo.
            </p>
          )}
          {!canTakeQuiz && (
            <p className="lesson-help-text">
              Bài kiểm tra cần ít nhất 4 từ có nghĩa khác nhau và đủ pinyin.
            </p>
          )}
          <button
            className="lesson-text-button"
            type="button"
            onClick={startQuiz}
            disabled={!canTakeQuiz}
          >
            Bỏ qua phần học và kiểm tra ngay
          </button>
        </section>
      )}

      {stage === "quiz" && currentQuestion && (
        <section className="lesson-quiz">
          <p className="lesson-quiz-prompt">
            Từ {questionIndex + 1}: {currentQuestion.vocabulary.wordSimplified}
          </p>

          <div className="lesson-question-part">
            <h3>1. Chọn nghĩa đúng</h3>
            <div className="lesson-answer-options">
              {currentQuestion.meaningOptions.map((option) => (
                <button
                  className={answer.meaning === option ? "is-selected" : ""}
                  key={`meaning-${currentQuestion.vocabulary.id}-${option}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() =>
                    setAnswer((current) => ({ ...current, meaning: option }))
                  }
                >
                  {option}
                </button>
              ))}
            </div>
            {isSubmitted && (
              <p>
                Đáp án: <strong>{currentQuestion.vocabulary.meaning}</strong>
              </p>
            )}
          </div>

          <div className="lesson-question-part">
            <h3>2. Chọn từ ứng với nghĩa này</h3>
            <p>{currentQuestion.vocabulary.meaning}</p>
            <div className="lesson-answer-options">
              {currentQuestion.wordOptions.map((option) => (
                <button
                  className={answer.word === option ? "is-selected" : ""}
                  key={`word-${currentQuestion.vocabulary.id}-${option}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() =>
                    setAnswer((current) => ({ ...current, word: option }))
                  }
                >
                  {option}
                </button>
              ))}
            </div>
            {isSubmitted && (
              <p>
                Đáp án:{" "}
                <strong lang="zh">
                  {currentQuestion.vocabulary.wordSimplified}
                </strong>
              </p>
            )}
          </div>

          <label className="lesson-answer-field">
            3. Viết pinyin của từ
            <input
              autoComplete="off"
              value={answer.pinyin}
              onChange={(event) =>
                setAnswer((current) => ({
                  ...current,
                  pinyin: event.target.value,
                }))
              }
              placeholder="Nhập pinyin có dấu thanh"
              disabled={isSubmitted}
            />
            {isSubmitted && (
              <span>
                Đáp án: <strong>{currentQuestion.vocabulary.pinyin}</strong>
              </span>
            )}
          </label>

          {isSubmitted && (
            <p
              className={`lesson-answer-feedback ${
                answer.meaning === currentQuestion.vocabulary.meaning &&
                answer.word === currentQuestion.vocabulary.wordSimplified &&
                normalizePinyin(answer.pinyin) ===
                  normalizePinyin(currentQuestion.vocabulary.pinyin)
                  ? "is-correct" : "is-incorrect"
              }`}
              role="status"
            >
              {answer.meaning === currentQuestion.vocabulary.meaning &&
              answer.word === currentQuestion.vocabulary.wordSimplified &&
              normalizePinyin(answer.pinyin) ===
                normalizePinyin(currentQuestion.vocabulary.pinyin)
                ? "Cả 3 phần đều chính xác!"
                : "Cần trả lời đúng cả 3 phần để tính câu này là đúng."}
            </p>
          )}

          {saveError && (
            <p className="lesson-answer-feedback is-incorrect" role="alert">
              Không lưu được kết quả: {saveError}
            </p>
          )}

          <div className="lesson-quiz-actions">
            {isSubmitted && questionIndex === questions.length - 1 && saveError ? (
              <button
                type="button"
                onClick={() => saveQuizResult(quizAnswers)}
              >
                Lưu lại kết quả
              </button>
            ) : isSubmitted && questionIndex < questions.length - 1 ? (
              <button type="button" onClick={goToNextQuestion}>
                Câu tiếp theo →
              </button>
            ) : (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={
                  !answer.meaning ||
                  !answer.word ||
                  !answer.pinyin.trim() ||
                  isSubmitted
                }
              >
                Trả lời
              </button>
            )}
          </div>
        </section>
      )}

      {stage === "result" && result && (
        <section className="lesson-result">
          <span className="lesson-result-score">{result.score}%</span>
          <h2>
            {result.passed
              ? "Bạn đã qua bài!"
              : result.completed
                ? "Tiến độ đã mở vẫn được giữ"
                : "Chưa đạt 80%"}
          </h2>
          <p>
            Đúng {result.correctAnswers} / {questions.length} câu.{" "}
            {result.passed
              ? "Bài học tiếp theo đã được mở."
              : result.completed
                ? "Lần kiểm tra này chưa đạt 80%, nhưng bài tiếp theo vẫn mở vì bạn đã qua bài trước đó."
              : "Hãy ôn lại từ vựng và thử lại nhé."}
          </p>
          {result.completed ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  nextLesson
                    ? `/hsk/${levelId}/lessons/${nextLesson.id}`
                    : "/hsk",
                )
              }
            >
              {nextLesson ? "Bài học tiếp theo →" : "Hoàn thành cấp độ"}
            </button>
          ) : (
            <button type="button" onClick={startQuiz}>
              Làm lại bài kiểm tra
            </button>
          )}
        </section>
      )}
    </main>
  );
};

export default Lesson;
