const API_URL = "http://localhost:5139/api/UserFlashcard";

export const getMyFlashcards = async () => {
    const token = localStorage.getItem("token");
    
    if(!token) {
        throw new Error("không tìm thấy người đăng nhập")
    }

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}` 
        }
    });
    const data = await response.json();
    
    if ( !response.ok) {
        throw new Error( data.message || "không thể lấy danh sách flashcard.");
    }
    return data;
}

export const addFlashcard = async (vocabularyId) => {
    const token = localStorage.getItem("token");

    if (!token){
        throw new Error("không tìm thấy token");
    }

    const response  = await fetch(`${API_URL}/${vocabularyId}`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    
    const data = await response.json();
    if( !response.ok) {
        throw new Error(
            data.message || "không thể thêm vào flashcard"
        );
    }
     return data;
    
}
export const removeFlashcard = async (vocabularyId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await fetch(
        `${API_URL}/${vocabularyId}`,
        {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Không thể xóa khỏi flashcard"
        );
    }

    return data;
};


//

export const reviewFlashcard = async (vocabularyId, quality) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await fetch(
        `${API_URL}/${vocabularyId}/review`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ quality })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Không thể cập nhật kết quả ôn tập"
        );
    }

    return data;
};