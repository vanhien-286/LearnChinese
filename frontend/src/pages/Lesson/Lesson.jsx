import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState   } from 'react';
import {getVocabulariesByLessonId} from "../../services/VocabularyService";
import {getLessonById} from"../../services/LessonService";
import "./Lesson.css";  
const Lesson = () => {
    const { levelId, lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [vocabularies, setVocabularies ] = useState([]);
    const [vocabularyLoading, setVocabularyLoading] = useState(true);
    const [vocabularyError, setVocabulryError] = useState("");

    const [currentVocabularyIndex, setCurrentVocabularyIndex] = useState(0);
    const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
    
    const [activeTab, setActiveTab] = useState("vocabulary")


    const [learnedVocabularyIds, setLearnedVocabularyIds] = useState([]);
    
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [correctAnswerCount, setCorrectAnswerCount] = useState(0);

    const [quizOptions, setQuizOptions] = useState([]);

    const [loading, setLoading ] = useState(true);
    const [error, setError] = useState("");

  useEffect (() =>  {
    const fetchLesson = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getLessonById(lessonId);
            setLesson(data);
           
        }catch(err) {
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
            setVocabulryError("");

            const data = await getVocabulariesByLessonId(lessonId);
            setVocabularies(data);
            setLearnedVocabularyIds([]);
            setCurrentVocabularyIndex(0);
            setShowFlashcardAnswer(false);
        }catch(err) {
            setVocabulryError(err.message);
        }finally {
            setVocabularyLoading(false);
        }
    };
    fetchVocabularies();
  }, [lessonId]);

  const currentVocabulary = vocabularies[currentVocabularyIndex];

  const handleShowAnswer = () => {
    setShowFlashcardAnswer(true);
  };

  const handlePreviousVocabulary = () => {
    if(currentVocabularyIndex > 0) {
        setCurrentVocabularyIndex(currentVocabularyIndex -1);
        setShowFlashcardAnswer(false);
    }
  };
  const handleNextVocabulary = () => {
    if(currentVocabularyIndex < vocabularies.length -1) {
        setCurrentVocabularyIndex(currentVocabularyIndex + 1);
        setShowFlashcardAnswer(false);
    }
  };

  const handleMarkAsLearned = () => {
    if(!currentVocabulary){
        return;
    }
    if(!learnedVocabularyIds.includes(currentVocabulary.id)){
        setLearnedVocabularyIds([
            ...learnedVocabularyIds,
            currentVocabulary.id
        ]);
    }
  };
  
  const handleMarkAsNotLearned = () => {
    if(!currentVocabulary) {
        return;
    }

    setLearnedVocabularyIds(
        learnedVocabularyIds.filter(
            id => id !== currentVocabulary.id
        )
    );
  };


  const currentQuestion = vocabularies[currentQuestionIndex];

    useEffect(() => {
        if (!currentQuestion || vocabularies.length < 4) {
            setQuizOptions([]);
            return;
        }

        const wrongOptions = vocabularies
            .filter(
                vocabulary => vocabulary.id !== currentQuestion.id
            )
            .slice(0, 3);

        const options = [currentQuestion, ...wrongOptions];

        // Xáo trộn đáp án
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [options[i], options[j]] = [options[j], options[i]];
        }

        setQuizOptions(options);
    }, [currentQuestion, vocabularies]);

    const handleSelectAnswer = (vocabularyId) => {
        if(showQuizResult){
            return;
        }

        setSelectedAnswer(vocabularyId);
        setShowQuizResult(true);
        if (vocabularyId === currentQuestion.id) {
            setCorrectAnswerCount(correctAnswerCount + 1);
        }

    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < vocabularies.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowQuizResult(false);
        }
    };



 if(loading) {
    return <div className="loading-state">Đang tải bài học...</div>;
 }
 if(error) {
    return <div className="error-state">Lỗi: {error}</div>;
 }

    return (
    <div className='lesson-page'>
        <button onClick={() => navigate(-1)}>
            Quay lại
        </button>

        <h1>Trang bài học</h1>
       
        <p>cấp độ: {levelId}</p>
        <p>bài học: {lessonId}</p>
        <h2>{lesson.title}</h2>

        <div className='vocabulary-statistics'>
            <p>tổng số từ: {vocabularies.length}</p>
            <p>Đã thuộc: {learnedVocabularyIds.length}</p>

            <p>
                chưa thuộc: {
                    vocabularies.length - learnedVocabularyIds.length
                }
            </p>
        </div>
        <div className='lesson-tabs'>
            <button className={activeTab == "vocabulary" ? "active" : ""}
                onClick={() => setActiveTab("vocabulary")}
            >
                từ vựng
            </button>
            <button className={activeTab == "multipleChoice" ? "active" : ""}
                onClick={() => setActiveTab("multipleChoice")}
            >
                trắc nghiệm
            </button>

            <button className={activeTab == "rewrite" ? "active" : ""}
                onClick={() => setActiveTab("rewrite")}
            >
                viết lại
            </button>

            <button className={activeTab == "flashcard" ? "active" : ""}
                onClick={() => setActiveTab("flashcard")}
            >
                lật thẻ
            </button>


        </div>
        <div className='lesson-tab-content'>
            
            {activeTab === "vocabulary"  && (
                <section className='vocabulary-section'>
                <h2> danh sách từ vựng</h2>

                {vocabularyLoading ? (
                    <p>đang tải từ vựng</p>
                ) : vocabularyError ? (
                    <p>lỗi:  {vocabularyError}</p>
                ) :(
                    vocabularies.length == 0 ? (
                        <p>không có từ vựng </p>
                    ) : (

                        <div className='vocabularies-list'>
                            {vocabularies.map((vocabulary) => (
                                <button onClick={() => navigate(`/vocabulary/${vocabulary.id}`)}>
                                    <div className='vocabulary-card' key={vocabulary.id}>
                                        <h3>{vocabulary.wordSimplified}</h3>
                                        <p>{vocabulary.pinyin}</p>
                                        <p>{vocabulary.meaning}</p>
                                        <p>{vocabulary.AudioUrl}</p>
                                    </div>          
                                </button>
                            ) )}
                        </div>
                    )
                )}
            </section>
            )}

           {activeTab === "flashcard" && (
             <section className='flashcard-section'>
                <h2>ôn tập bằng lật thẻ</h2>
                {vocabularies.length == 0 ? (
                    <p>chưa có từ vựng để ôn tập</p>
                ) : (
                    <div className='flashcard'>
                        <h3>{currentVocabulary.wordSimplified}</h3>
                        <p>{currentVocabulary.pinyin}</p>

                        {showFlashcardAnswer && (
                            <div className='flashcard-answer'>
                                <p>Nghĩa: {currentVocabulary.meaning}</p>
                            </div>
                        )}
                        <div className='flashcard-action'>
                            <button  disabled= {currentVocabularyIndex == 0}onClick={handlePreviousVocabulary}>
                                Từ trước
                            </button>

                            <button disabled= {showFlashcardAnswer} onClick={handleShowAnswer}>
                                Xem đáp án
                            </button>

                            <button onClick={handleMarkAsLearned}
                                disabled={!currentVocabulary || learnedVocabularyIds.includes(currentVocabulary.id)}
                            >
                                đã thuộc
                            </button>

                            <button
                                onClick={handleMarkAsNotLearned}
                                disabled={
                                    !currentVocabulary ||
                                    !learnedVocabularyIds.includes(currentVocabulary.id)
                                }
                            >
                                Chưa thuộc
                            </button>

                            <button onClick={handleNextVocabulary} 
                                disabled={currentVocabularyIndex >= vocabularies.length -1 }>
                                    từ tiếp theo
                            </button>

                        </div>
                        <p>
                        Từ {currentVocabularyIndex + 1} / {vocabularies.length}
                        </p>
                    </div>
                    
                )}
            </section>
           )}
        

        {activeTab === "multipleChoice" && (
            <section className='quiz-section'>
                <h2>Trắc nghiệm từ vựng</h2>

                {vocabularies.length < 4 ? (
                    <p>cần ít nhất 4 từ vựng</p>
                ) : (
                    <>
                        <p>câu {currentQuestionIndex + 1} / {vocabularies.length} </p>
                        <h3>{currentQuestion.wordSimplified}d</h3>
                        <p>{currentQuestion.pinyin}</p>


                        <p>chọn nghĩa tiếng việt chính xác</p>

                        <div className='quiz-option'>
                            {quizOptions.map((option) => (
                                <button key={option.id}
                                    onClick={() => handleSelectAnswer(option.id)}
                                    disabled={showQuizResult}
                                >
                                    {option.meaning}
                                </button>
                            ))}
                        </div>


                        {showQuizResult && (
                            <p>
                                {selectedAnswer === currentQuestion.id 
                                ? "chính xác" : `chưa chính xác. Đáp án là: ${currentQuestion.meaning}` }
                                
                            </p>
                        )}

                         {showQuizResult && (
                    <button
                        onClick={handleNextQuestion}
                        disabled={
                            currentQuestionIndex === vocabularies.length - 1
                        }
                    >
                        Câu tiếp theo
                    </button>
                )}
                    <p>Số câu đúng: {correctAnswerCount}</p>
                    </>
                )}
            </section>
        )}
        </div>
    </div>
  )
}

export default Lesson