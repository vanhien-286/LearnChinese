import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVocabulariesByLessonId } from "../../services/VocabularyService";
import {
    addFlashcard,
    getMyFlashcards,
    removeFlashcard
} from "../../services/UserFlashcardService";
import "./VocabularyLearning.css";
const VocabularyLearning = () => {
    const { levelId, lessonId } = useParams();
    const navigate = useNavigate();

    const [vocabularies, setVocabularies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showAnswer, setShowAnswer] = useState(false);
    const [flashcards, setFlashcards] = useState([]);
   
    const [flashcardLoading, setFlashcardLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

   


    useEffect(() => {
        const fetchVocabularies = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getVocabulariesByLessonId(lessonId);

                setVocabularies(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVocabularies();
    }, [lessonId]);

    useEffect(() => {
    const fetchFlashcards = async () => {
        try {
            const data = await getMyFlashcards();
            setFlashcards(data);
        } catch (err) {
            console.error("Lỗi tải flashcard:", err);
        }
    };

    fetchFlashcards();
}, []);

    
const handleRemember = async () => {
    if (!currentVocabulary || flashcardLoading) return;

    try {
        setFlashcardLoading(true);

        if (isRemembered) {
            await removeFlashcard(currentVocabulary.id);

            setFlashcards((prev) =>
                prev.filter(
                    (flashcard) =>
                        flashcard.vocabularyId !== currentVocabulary.id
                )
            );
        } else {
            const data = await addFlashcard(currentVocabulary.id);

            setFlashcards((prev) => [
                ...prev,
                {
                    id: data.flashcardId,
                    vocabularyId: currentVocabulary.id
                }
            ]);
        }
    } catch (err) {
        alert(err.message);
    } finally {
        setFlashcardLoading(false);
    }
};
   

    const currentVocabulary = vocabularies[currentIndex];
    const isRemembered = currentVocabulary
    ? flashcards.some(
        (flashcard) =>
            flashcard.vocabularyId === currentVocabulary.id
      )
    : false;

    const isLastWord = currentIndex === vocabularies.length - 1;

   const handleNext = () => {
    if (!isLastWord) {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
    }
};

const handlePrevious = () => {
    if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setShowAnswer(false);
    }
};

    const handleFinish = () => {
        navigate(`/hsk/${levelId}/lessons/${lessonId}`);
    };
    
     if (loading) {
        return <div className="page-content vocabulary-learning-page">Đang tải từ vựng...</div>;
    }

    if (error) {
        return <div className="page-content vocabulary-learning-page">Lỗi: {error}</div>;
    }

    if (vocabularies.length === 0) {
        return (
            <div className="page-content vocabulary-learning-page">
                <h2>Lesson chưa có từ vựng</h2>

                <button onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
            </div>
        );
    }
    return (
        <div className="page-content vocabulary-learning-page">

            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                ← Quay lại
            </button>

            <div className="vocabulary-learning-header">
                <span>HSK {levelId}</span>

                <h1>Học từ vựng</h1>

                <p>
                    Từ {currentIndex + 1} / {vocabularies.length}
                </p>
            </div>



            <button
    type="button"
    className={`vocabulary-learning-card ${
        showAnswer ? "is-flipped" : ""
    }`}
    onClick={() => setShowAnswer((prev) => !prev)}
    aria-label={
        showAnswer
            ? "Ẩn đáp án"
            : "Lật thẻ để xem đáp án"
    }
>
    {!showAnswer ? (
        <div className="flashcard-front">
            <span className="flashcard-label">
                TỪ VỰNG
            </span>

            <h2>{currentVocabulary.wordSimplified}</h2>

            {currentVocabulary.wordTraditional && (
                <p className="flashcard-traditional">
                    Phồn thể: {currentVocabulary.wordTraditional}
                </p>
            )}

            <p className="flashcard-hint">
                Nhấn vào thẻ để xem đáp án
            </p>
        </div>
    ) : (
        <div className="flashcard-back">
            <span className="flashcard-label">
                ĐÁP ÁN
            </span>

           

            <p className="flashcard-meaning">
                {currentVocabulary.meaning || "Chưa cập nhật nghĩa"}
            </p>

            {currentVocabulary.exampleSentence && (
                <div className="flashcard-example">
                    <p>{currentVocabulary.exampleSentence}</p>

                    {currentVocabulary.examplePinyin && (
                        <p>{currentVocabulary.examplePinyin}</p>
                    )}

                    {currentVocabulary.exampleMeaning && (
                        <p>{currentVocabulary.exampleMeaning}</p>
                    )}
                </div>
            )}

            <p className="flashcard-hint">
                Nhấn vào thẻ để ẩn đáp án
            </p>
        </div>
    )}
</button>



            <button
                className="vocabulary-learning-remember"
                onClick={handleRemember}
                disabled={flashcardLoading}
                aria-pressed={isRemembered}
            >
                {flashcardLoading
                    ? "Đang xử lý..."
                    : isRemembered
                        ? "Đã ghi nhớ"
                        : "Ghi nhớ"}
            </button>

            <div className="vocabulary-learning-actions">

                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    ← Từ trước
                </button>

                {!isLastWord ? (
                    <button onClick={handleNext}>
                        Từ tiếp theo →
                    </button>
                ) : (
                    <button onClick={handleFinish}>
                        🎉 Hoàn thành
                    </button>
                )}

            </div>

        </div>
    );
};

export default VocabularyLearning;