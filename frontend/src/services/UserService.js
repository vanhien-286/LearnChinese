const API_URL = "http://localhost:5139/api/user";
export const RegisterUser = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
    }
    return data;
}

export const LoginUser = async (userData) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
    }   
    return data;
}

export const getUserProfile = async () => {
    const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
    }
    const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Không thể lấy thông tin người dùng");
    }

    return data;
}