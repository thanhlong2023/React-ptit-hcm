/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { login, saveAuthToken } from '../services/authService'; 
import '../pages/RegisterPage.css'; 

function LoginForm() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('')  ; 
  const [error, setError] = useState(''); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.'); 
      return;
    }
    
    setError(''); 

    try {
      const response = await login({ email, password });
      
      // Kiểm tra có thành công và có token giả không
      if (response.success && response.token) { 
        
        // 🔑 Lưu token giả vào Local Storage
        saveAuthToken(response.token); 
        
        console.log('Đăng nhập thành công, người dùng:', response.user);
        
        // Điều hướng về trang chủ
        navigate('/'); 
      } else {
        // response.message được trả về từ service nếu thất bại
        setError(response.message || 'Đăng nhập thất bại.');
      }
    } catch (e) {
        setError('Lỗi kết nối hoặc xử lý đăng nhập.');
    }
  };

  return (
    <div className="signup-container"> 
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>🔑 Đăng Nhập Tài Khoản</h2>

        {error && <p className="error-message">{error}</p>} 

        {/* Trường Email */}
        <div className="form-group"> 
          <label htmlFor="email">Email</label> 
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email của bạn"
          /> 
        </div>

        {/* Trường Mật khẩu */}
        <div className="form-group"> 
          <label htmlFor="password">Mật khẩu</label> 
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mật khẩu"
          /> 
        </div>

        {/* Nút Đăng nhập */}
        <button type="submit" className="submit-button"> 
          Đăng Nhập
        </button>
        
        {/* Liên kết đến trang Đăng ký */}
        <p className="login-link"> 
          Chưa có tài khoản? <NavLink to="/signup">Đăng ký ngay</NavLink> 
        </p>
      </form>
    </div>
  );
}

export default LoginForm;