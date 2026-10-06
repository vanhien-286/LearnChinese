const API_URL = "http://localhost:5139/api/vocabulary";

export const getAllVocabulary = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("không thể lấy dữ liệu từ vựng");
    }
    return response.json();
}
export const getVocabularyById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`không thể lấy dữ liệu từ vựng với id ${id}`);
    }
    return response.json();
}
export const getVocabulariesByLessonId = async (lessonId) => {
    const response = await fetch(`${API_URL}/lesson/${lessonId}`);
    if (!response.ok) {
        throw new Error(`không thể lấy dữ liệu từ vựng với lessonId ${lessonId}`);
    }
    return response.json();
}