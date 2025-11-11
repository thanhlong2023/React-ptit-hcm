import { useState } from 'react';
import { register } from '../services/authService'; 
import "./RegisterPage.css"; 

function SignUpForm() {
  const [fullName, setFullName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.'); 
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.'); 
      return;
    }

    try {
      setError(''); 
      setSuccess(''); 

      const response = await register({
        email,
        password,
        fullName,
      });

      if (response.success && response.user) {
        console.log('Đăng ký thành công:', response.user);
          window.location.href = '/login'; 
      } else {
        setError(response.message || 'Đăng ký thất bại'); 
      }
    } catch {
      setError('Có lỗi xảy ra khi kết nối đến máy chủ.'); 
    }
  };

  return (
    <div className="signup-container"> 
      <form onSubmit={handleSubmit} className="signup-form"> 
        <h2>🎬 Đăng Ký Tài Khoản</h2> 

        {error && <p className="error-message">{error}</p>} 
        {success && <p className="success-message">{success}</p>} 

        <div className="form-group"> 
          <label htmlFor="fullName">Họ và Tên</label> 
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Nhập họ và tên của bạn"
          /> 
        </div>

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

        <div className="form-group"> 
          <label htmlFor="password">Mật khẩu</label> 
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Tối thiểu 6 ký tự"
          /> 
        </div>

        <div className="form-group"> 
          <label htmlFor="confirmPassword">Xác nhận Mật khẩu</label> 
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Nhập lại mật khẩu"
          /> 
        </div>

        <button type="submit" className="submit-button">
          Đăng Ký
        </button>

        <p className="login-link"> 
          Bạn đã có tài khoản? <a href="/login">Đăng nhập ngay</a> 
        </p>
      </form>
    </div>
  );
}

export default SignUpForm;