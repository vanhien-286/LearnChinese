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
        return (
            <div className="page-content">
                <p>Đang tải từ vựng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content">
                <p>Lỗi: {error}</p>
            </div>
        );
    }

    if (!vocabulary) {
        return (
            <div className="page-content">
                <p>Không tìm thấy từ vựng.</p>
            </div>
        );
    }

    return (
        <div className="page-content">

            {/* Quay lại */}
            <button
                className="vocabulary-back-button"
                onClick={() => navigate(-1)}
            >
                ← Quay lại
            </button>


            {/* Thông tin chính */}
            <div className="vocabulary-detail-card">

                <div className="vocabulary-detail-main">

                    <span className="vocabulary-detail-label">
                        Từ vựng
                    </span>

                    <h1>
                        {vocabulary.wordSimplified}
                    </h1>

                    {vocabulary.wordTraditional && (
                        <p className="vocabulary-detail-traditional">
                            {vocabulary.wordTraditional}
                        </p>
                    )}

                    <p className="vocabulary-detail-pinyin">
                        {vocabulary.pinyin}
                    </p>

                    <span className="vocabulary-detail-pos">
                        {vocabulary.partOfSpeech || "Chưa cập nhật"}
                    </span>

                </div>


                {/* Nghĩa */}
                <div className="vocabulary-detail-section">

                    <h2>Nghĩa</h2>

                    <p>
                        {vocabulary.meaning || "Chưa cập nhật"}
                    </p>

                </div>


                {/* Ví dụ */}
                {vocabulary.exampleSentence && (
                    <div className="vocabulary-detail-section">

                        <h2>Ví dụ</h2>

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

                    </div>
                )}


               
                {vocabulary.audioUrl && (
                    <div className="vocabulary-detail-section">

                        <h2>Phát âm</h2>
                        {vocabulary.audioUrl ? (
                             <audio
                            controls
                            src={vocabulary.audioUrl}
                        >
                            Trình duyệt của bạn không hỗ trợ audio.
                        </audio> ): (
                            <p className="audio_empty">
                                Chưa có audio cho từ này.
                            </p>
                        )}

                       

                    </div>
                )}

            </div>

        </div>
    );
};

export default VocabularyDetail;