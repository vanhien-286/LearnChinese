
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getMyFlashcards,
    reviewFlashcard
} from "../../services/UserFlashcardService";
import "./FlashcardReview.css";

const FlashcardReview = () => {
    const navigate = useNavigate();

    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyFlashcards();
                setFlashcards(data);
            } catch (err) {
                setError(err.message || "Không thể tải Flashcard.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcards();
    }, []);

    const currentFlashcard = flashcards[currentIndex];
    const vocabulary = currentFlashcard?.vocabulary;

    const handleReview = async (quality) => {
        if (!currentFlashcard || reviewing) return;

        try {
            setReviewing(true);

            // quality = 0: Đã quên
            // quality = 1: Đã nhớ
            await reviewFlashcard(
                currentFlashcard.vocabularyId,
                quality
            );

            // Xóa thẻ khỏi phiên ôn tập hiện tại,
            // không xóa Flashcard khỏi cơ sở dữ liệu.
            setFlashcards((prev) =>
                prev.filter((_, index) => index !== currentIndex)
            );

            setReviewedCount((prev) => prev + 1);
            setShowAnswer(false);
        } catch (err) {
            alert(err.message || "Không thể cập nhật kết quả ôn tập.");
        } finally {
            setReviewing(false);
        }
    };

    if (loading) {
        return <div className="flashcard-review-message">
            Đang tải Flashcard...
        </div>;
    }

    if (error) {
        return <div className="flashcard-review-message">
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>;
    }

    if (flashcards.length === 0) {
        return (
            <div className="flashcard-review-page">
                <div className="flashcard-review-complete">
                    <h2>🎉 Hoàn thành phiên ôn tập!</h2>
                    <p>
                        Bạn đã ôn {reviewedCount} từ trong phiên này.
                    </p>
                    <p>
                        {reviewedCount === 0
                            ? "Bạn chưa có Flashcard nào để ôn tập."
                            : "Hãy quay lại vào lần ôn tập tiếp theo nhé!"}
                    </p>
                    <button onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-review-page">
            <div className="flashcard-review-header">
                <button
                    className="flashcard-review-back"
                    onClick={() => navigate(-1)}
                >
                    ← Quay lại
                </button>

                <h1>Ôn tập Flashcard</h1>

                <p>
                    Còn lại: {flashcards.length} từ
                </p>
            </div>

            <div className="flashcard-review-progress">
                <div
                    className="flashcard-review-progress-bar"
                    style={{
                        width: `${
                            (reviewedCount /
                                (reviewedCount + flashcards.length)) * 100
                        }%`
                    }}
                />
            </div>

            <div className="flashcard-review-card">
                <p className="flashcard-review-label">
                    TỪ VỰNG TIẾNG TRUNG
                </p>

                <h2>
                    {vocabulary?.wordSimplified || "Chưa có từ vựng"}
                </h2>

                {vocabulary?.wordTraditional && (
                    <p className="flashcard-review-traditional">
                        Phồn thể: {vocabulary.wordTraditional}
                    </p>
                )}

                {showAnswer ? (
                    <div className="flashcard-review-answer">
                        <p className="flashcard-review-pinyin">
                            {vocabulary?.pinyin || "Chưa có Pinyin"}
                        </p>

                        <p className="flashcard-review-meaning">
                            {vocabulary?.meaning || "Chưa cập nhật nghĩa"}
                        </p>

                        {vocabulary?.exampleSentence && (
                            <div className="flashcard-review-example">
                                <p>
                                    {vocabulary.exampleSentence}
                                </p>
                                {vocabulary.exampleMeaning && (
                                    <p>{vocabulary.exampleMeaning}</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className="flashcard-review-reveal"
                        onClick={() => setShowAnswer(true)}
                    >
                        Xem đáp án
                    </button>
                )}
            </div>

            {showAnswer && (
                <div className="flashcard-review-actions">
                    <p>Bạn có nhớ từ này không?</p>

                    <div className="flashcard-review-buttons">
                        <button
                            className="flashcard-review-forgot"
                            onClick={() => handleReview(0)}
                            disabled={reviewing}
                        >
                            {reviewing ? "Đang lưu..." : "Chưa nhớ"}
                        </button>

                        <button
                            className="flashcard-review-remembered"
                            onClick={() => handleReview(1)}
                            disabled={reviewing}
                        >
                            {reviewing ? "Đang lưu..." : "Đã nhớ"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardReview;