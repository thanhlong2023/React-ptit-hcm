# Hướng Dẫn Thiết Lập Hệ Thống Đăng Ký & Đăng Nhập

## 📋 Tổng Quan

Hệ thống gồm có:
- **Backend**: JSON Server (chạy trên port 3000)
- **Database**: `db.json` 
- **Frontend**: React pages (LoginPage, RegisterPage)
- **Services**: `authService.ts` (xử lý API calls)

## 🚀 Cách Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy JSON Server (Terminal 1)
```bash
npm run api
```
Hoặc:
```bash
json-server --watch db.json --port 3000
```

Server sẽ chạy tại: `http://localhost:3000`

### 3. Chạy React App (Terminal 2)
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

## 📁 Cấu Trúc File

### `db.json`
Database chứa danh sách users:
```json
{
  "users": [
    {
      "id": 1,
      "email": "test@example.com",
      "password": "password123",
      "fullName": "Test User",
      "createdAt": "2025-11-11T00:00:00Z"
    }
  ]
}
```

### `src/services/authService.ts`
Chứa các function:
- `register(userData)` - Đăng ký tài khoản mới
- `login(email, password)` - Đăng nhập
- `logout()` - Đăng xuất
- `getCurrentUser()` - Lấy thông tin user hiện tại
- `getAuthToken()` - Lấy token từ localStorage

### `src/pages/LoginPage.tsx`
- Gọi `login()` từ authService
- Lưu token và user vào localStorage
- Chuyển hướng đến home khi login thành công

### `src/pages/RegisterPage.tsx`
- Gọi `register()` từ authService
- Kiểm tra mật khẩu trùng khớp
- Chuyển hướng đến login khi đăng ký thành công

## 🔐 Tài Khoản Test

Sau khi chạy, có thể test với:
- **Email**: test@example.com
- **Password**: password123

## ✨ Chức Năng

### Đăng Ký
1. Nhập Họ và Tên, Email, Mật khẩu
2. Xác nhận mật khẩu
3. Click "Đăng Ký"
4. Hệ thống kiểm tra:
   - Email không tồn tại
   - Mật khẩu ≥ 6 ký tự
   - Mật khẩu trùng khớp
5. Tạo user mới trong db.json
6. Chuyển hướng đến trang login

### Đăng Nhập
1. Nhập Email và Mật khẩu
2. Click "Đăng Nhập"
3. Hệ thống kiểm tra:
   - Email tồn tại
   - Mật khẩu chính xác
4. Tạo token JWT đơn giản
5. Lưu token và user info vào localStorage
6. Chuyển hướng đến home

## 🔄 API Endpoints

JSON Server tự động tạo endpoints từ `db.json`:

- `GET /users` - Lấy tất cả users
- `GET /users?email=<email>` - Tìm user theo email
- `POST /users` - Tạo user mới
- `GET /users/<id>` - Lấy user theo ID
- `PUT /users/<id>` - Cập nhật user
- `DELETE /users/<id>` - Xóa user

## 📝 Ghi Chú

- Token được mã hóa Base64 đơn giản (trong production nên dùng JWT)
- Password được lưu plain text (trong production phải hash)
- Không có middleware xác thực (authentication middleware)
- Chưa có protected routes

## 🛠️ Cải Tiến Tiếp Theo

- [ ] Thêm hashing password (bcrypt)
- [ ] Thêm JWT tokens thực
- [ ] Thêm protected routes
- [ ] Thêm API interceptors
- [ ] Thêm refresh token
- [ ] Thêm remember me
- [ ] Thêm email verification
