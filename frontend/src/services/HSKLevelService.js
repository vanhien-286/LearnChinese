const API_URL = "http://localhost:5139/api/HSKLevel";
export const getHSKLevels = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
    }
    const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy danh sách HSK Levels");
    }

    return data;
}
export const getHSKLevelById = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Không thể lấy cấp độ HSK"
        );
    }

    return data;
};