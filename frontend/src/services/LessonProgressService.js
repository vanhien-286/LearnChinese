const API_URL = "http://localhost:5139/api/UserLesson";

const getAuthorizationHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Không tìm thấy token đăng nhập.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const readResponse = async (response, defaultError) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || defaultError);
  }

  return data;
};

export const getLessonProgress = async (levelId) => {
  const response = await fetch(`${API_URL}/level/${levelId}`, {
    headers: getAuthorizationHeaders(),
  });

  return readResponse(response, "Không thể tải tiến độ bài học.");
};

export const saveLessonResult = async (lessonId, answers) => {
  const response = await fetch(`${API_URL}/${lessonId}/result`, {
    method: "POST",
    headers: {
      ...getAuthorizationHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }),
  });

  return readResponse(response, "Không thể lưu kết quả bài học.");
};
