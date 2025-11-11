/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/authService.ts

const API_BASE_URL = "http://localhost:3000";
const USER_TOKEN_KEY = 'user_token';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string; 
}

//  HÀM ĐĂNG KÝ 
export const register = async (userData: any): Promise<AuthResponse> => {
  try {
    // 1. KIỂM TRA EMAIL ĐÃ TỒN TẠI CHƯA (Sử dụng GET request)
    const checkUrl = `${API_BASE_URL}/users?email=${encodeURIComponent(userData.email)}`;
    const checkRes = await fetch(checkUrl);
    
    if (!checkRes.ok) {
        throw new Error('Lỗi kiểm tra email.');
    }
    
    const existingUsers = await checkRes.json();

    if (existingUsers.length > 0) {
        // Nếu tìm thấy bất kỳ người dùng nào với email này, từ chối đăng ký
        return { success: false, message: 'Email đã được sử dụng. Vui lòng chọn email khác.' };
    }


    // 2. THỰC HIỆN ĐĂNG KÝ (POST request)
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Thêm createdAt cho dữ liệu mô phỏng
      body: JSON.stringify({...userData, createdAt: new Date().toISOString()}), 
    });

    if (response.ok) {
      const user = await response.json();
      return { success: true, user, message: 'Đăng ký thành công!' };
    }
    
    // Xử lý lỗi POST nếu có
    const errorData = await response.json(); 
    return { success: false, message: errorData.message || 'Đăng ký thất bại do lỗi máy chủ.' };

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return { success: false, message: 'Có lỗi kết nối đến máy chủ.' };
  }
};


// ... (Các hàm login, saveAuthToken, getAuthToken, removeAuthToken giữ nguyên) ...

export const login = async (credentials: any): Promise<AuthResponse> => {
  try {
    // ... logic login giữ nguyên ...
    const url = `${API_BASE_URL}/users?email=${encodeURIComponent(credentials.email)}`;
    
    const response = await fetch(url);
    const users = await response.json();

    if (users.length === 0) {
      return { success: false, message: 'Email không tồn tại.' };
    }

    const user = users[0];
    
    if (user.password === credentials.password) {
      const fakeToken = `token_${user.id}_${Date.now()}`; 
      return { success: true, user, token: fakeToken }; 
    } else {
      return { success: false, message: 'Mật khẩu không đúng.' };
    }

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return { success: false, message: 'Có lỗi kết nối đến máy chủ.' };
  }
};


export const saveAuthToken = (token: string) => {
    localStorage.setItem(USER_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem(USER_TOKEN_KEY);
};

export const removeAuthToken = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
};