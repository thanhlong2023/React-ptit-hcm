/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = "http://localhost:3000";
const USER_TOKEN_KEY = "user_token";
const USER_DATA_KEY = "user_data";

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
}

// HÀM: Lấy ID người dùng hiện tại (dùng cho các API call)
export const getCurrentUserId = (): number | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (userData) {
    const user = JSON.parse(userData);
    // Đảm bảo id là kiểu number
    return user.id;
  }
  return null;
};

// HÀM: Lấy danh sách ID phim yêu thích
export const getFavoriteIds = async (userId: number): Promise<number[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!res.ok) return [];
    const user = await res.json();
    // Giả định trường favorites là mảng các ID phim (number[])
    return user.favorites || [];
  } catch {
    return [];
  }
};

// HÀM : Thêm/Xóa phim khỏi danh sách yêu thích
export const toggleFavorite = async (
  userId: number,
  movieId: number,
  isAdding: boolean
): Promise<boolean> => {
  try {
    // 1. Lấy dữ liệu user hiện tại
    const res = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!res.ok) return false;
    const user = await res.json();
    let currentFavorites: number[] = user.favorites || [];

    // 2. Xử lý mảng (Thêm hoặc Xóa ID phim)
    if (isAdding) {
      // Thêm nếu chưa có
      if (!currentFavorites.includes(movieId)) {
        currentFavorites.push(movieId);
      }
    } else {
      // Xóa khỏi mảng
      currentFavorites = currentFavorites.filter((id) => id !== movieId);
    }

    // 3. Gửi PATCH request để cập nhật trường favorites
    const updateRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: currentFavorites }),
    });

    return updateRes.ok;
  } catch {
    return false;
  }
};

// HÀM ĐĂNG KÝ
export const register = async (userData: any): Promise<AuthResponse> => {
  try {
    // 1. KIỂM TRA EMAIL ĐÃ TỒN TẠI CHƯA (Sử dụng GET request)
    const checkUrl = `${API_BASE_URL}/users?email=${encodeURIComponent(
      userData.email
    )}`;
    const checkRes = await fetch(checkUrl);

    if (!checkRes.ok) {
      throw new Error("Lỗi kiểm tra email.");
    }

    const existingUsers = await checkRes.json();

    if (existingUsers.length > 0) {
      // Nếu tìm thấy bất kỳ người dùng nào với email này, từ chối đăng ký
      return {
        success: false,
        message: "Email đã được sử dụng. Vui lòng chọn email khác.",
      };
    }

    // 2. THỰC HIỆN ĐĂNG KÝ (POST request)
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Thêm createdAt và mảng favorites trống ban đầu
      body: JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString(),
        favorites: [], // KHỞI TẠO MẢNG YÊU THÍCH RỖNG
      }),
    });

    if (response.ok) {
      const user = await response.json();
      return { success: true, user, message: "Đăng ký thành công!" };
    }

    // Xử lý lỗi POST nếu có
    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || "Đăng ký thất bại do lỗi máy chủ.",
    };
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return { success: false, message: "Có lỗi kết nối đến máy chủ." };
  }
};

// CẬP NHẬT LOGIC LOGIN: Lưu token và user data
export const login = async (credentials: any): Promise<AuthResponse> => {
  try {
    // logic login
    const url = `${API_BASE_URL}/users?email=${encodeURIComponent(
      credentials.email
    )}`;

    const response = await fetch(url);
    const users = await response.json();

    if (users.length === 0) {
      return { success: false, message: "Email không tồn tại." };
    }

    const user = users[0];

    if (user.password === credentials.password) {
      const fakeToken = `token_${user.id}_${Date.now()}`;
      return { success: true, user, token: fakeToken }; // Trả về user object đầy đủ
    } else {
      return { success: false, message: "Mật khẩu không đúng." };
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return { success: false, message: "Có lỗi kết nối đến máy chủ." };
  }
};

// Lưu dữ liệu người dùng
export const saveUserData = (user: any) => {
  // Chỉ lưu các trường cần thiết (ví dụ: id, fullName, email)
  const dataToStore = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToStore));
};

// Lấy dữ liệu người dùng
export const getStoredUserData = () => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveAuthToken = (token: string) => {
  localStorage.setItem(USER_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(USER_TOKEN_KEY);
};

// HÀM ĐĂNG XUẤT: Xóa cả user data
export const removeAuthToken = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};
