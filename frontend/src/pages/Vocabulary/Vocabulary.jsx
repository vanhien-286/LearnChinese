import { useParams } from "react-router-dom";
import { getVocabulariesByLessonId } from "../../services/VocabularyService";
import { useEffect, useState } from "react";
import "./Vocabulary.css";
import { useNavigate } from "react-router-dom";
const Vocabulary = () => {
    const { lessonId } = useParams();
    const [vocabularies, setVocabularies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const loadVocabularies = async () => {
            const data = await getVocabulariesByLessonId(lessonId);

            setVocabularies(data);
            setLoading(false);
        };

        loadVocabularies();
    }, [lessonId]);
    if (loading) {
    return <div>Đang tải từ vựng...</div>;
}  
    return (
        <div className="vocabulary-page">
            <h1>Vocabulary</h1>
            <div className="vocabulary-list">
                {vocabularies.map((vocabulary) => (
                <div className="vocabulary-item" 
                key={vocabulary.id}
                onClick ={() => navigate(`/vocabulary/${vocabulary.id}`)}
                >
                    <h2>{vocabulary.wordSimplified}</h2>
                    <p className="vocabulary-traditional">{vocabulary.wordTraditional}</p>
                    <p className="vocabulary-pinyin">{vocabulary.pinyin}</p>
                    <p className="vocabulary-definition">{vocabulary.meaning}</p>
                </div>
            ))}
            </div>
            
        </div>
    );
};

export default Vocabulary;