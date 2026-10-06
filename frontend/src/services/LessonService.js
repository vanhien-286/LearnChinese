const API_URL = "http://localhost:5139/api/Lesson";

export const getAllLessons = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("không thể lấy dữ liệu bài học");
    }
    return response.json();
}

export const getLessonById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`không thể lấy dữ liệu bài học với id ${id}`);
    }
    return response.json();
}

export const getLessonsByCourseId = async (courseId) => {
    const response = await fetch(`${API_URL}/course/${courseId}`);
    if (!response.ok) {
        throw new Error(`không thể lấy dữ liệu bài học với courseId ${courseId}`);
    }
    return response.json();
}

export const getLessonsByLevel = async (levelId) => {
    const response = await fetch(`${API_URL}/level/${levelId}`);
    if (!response.ok) {
        throw new Error(`không thể lấy dữ liệu bài học với levelId ${levelId}`);
    }
    return response.json();
}

