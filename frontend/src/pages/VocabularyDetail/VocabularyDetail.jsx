
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVocabularyById } from "../../services/VocabularyService";
import "./VocabularyDetail.css";

const VocabularyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vocabulary, setVocabulary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadVocabulary = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getVocabularyById(id);
                setVocabulary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadVocabulary();
    }, [id]);

    if (loading) {
        return <div className="vocabulary-detail-page">
            Đang tải chi tiết từ vựng...
        </div>;
    }

    if (error) {
        return (
            <div className="vocabulary-detail-page">
                <p>Lỗi: {error}</p>
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Quay lại
                </button>
            </div>
        );
    }

    if (!vocabulary) {
        return (
            <div className="vocabulary-detail-page">
                <p>Không tìm thấy từ vựng.</p>
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="vocabulary-detail-page">
            <button
                onClick={() => navigate(-1)}
                className="back-button"
            >
                ← Quay lại
            </button>

            <div className="vocabulary-detail-card">
                <div className="word-section">
                    <h1>{vocabulary.wordSimplified}</h1>

                    {vocabulary.wordTraditional && (
                        <p className="detail-traditional">
                            Phồn thể: {vocabulary.wordTraditional}
                        </p>
                    )}

                    <p className="detail-pinyin">
                        {vocabulary.pinyin}
                    </p>

                    {vocabulary.partOfSpeech && (
                        <span className="detail-part-of-speech">
                            {vocabulary.partOfSpeech}
                        </span>
                    )}
                </div>

                <div className="meaning-section">
                    <h2>Nghĩa</h2>
                    <p>
                        {vocabulary.meaning || "Chưa cập nhật nghĩa"}
                    </p>
                </div>

                <div className="example-section">
                    <h2>Ví dụ</h2>

                    {vocabulary.exampleSentence ? (
                        <>
                            <p className="example-sentence">
                                {vocabulary.exampleSentence}
                            </p>

                            {vocabulary.examplePinyin && (
                                <p className="example-pinyin">
                                    {vocabulary.examplePinyin}
                                </p>
                            )}

                            {vocabulary.exampleMeaning && (
                                <p className="example-meaning">
                                    {vocabulary.exampleMeaning}
                                </p>
                            )}
                        </>
                    ) : (
                        <p>Chưa có ví dụ cho từ vựng này.</p>
                    )}
                </div>

                {vocabulary.audioUrl && (
                    <div className="audio-section">
                        <h2>Phát âm</h2>
                        <audio controls src={vocabulary.audioUrl}>
                            Trình duyệt không hỗ trợ phát âm thanh.
                        </audio>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabularyDetail;