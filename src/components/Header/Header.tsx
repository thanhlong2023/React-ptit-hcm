import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBox from "../SearchBox/SearchBox";
import styles from "./Header.module.css";
// BỔ SUNG: Import các hàm quản lý Auth (Giả định bạn đã có file này)
import { getAuthToken, removeAuthToken } from "../../services/authService";

export default function Header() {
  // 🔑 1. GỌI TẤT CẢ CÁC HOOKS TRÊN ĐẦU COMPONENT (KHÔNG CÓ IF/ELSE)
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // State để theo dõi trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  const authPaths = ["/login", "/signup"];

  // Hook xử lý cuộn trang để đổi màu Header
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, [location.pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false); 
    navigate("/");
  };

  if (authPaths.includes(location.pathname)) {
    return null;
  }

  const navigator = () => navigate("/");

  const AuthButtons = isAuthenticated ? (
    <button className={styles.loginLink} onClick={handleLogout} type="button">
      Đăng Xuất
    </button>
  ) : (
    <NavLink to="/login" className={styles.loginLink}>
      Đăng Nhập
    </NavLink>
  );

  return (
    <header className={`${styles.header} ${scrolled ? styles.solid : ""}`}>
      <div className={styles.inner}>
        <div
          className={styles.logo}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className={styles.logoMark} onClick={navigator}>
            🎬
          </div>
          <div className={styles.logoText} onClick={navigator}>
            <span className={styles.brand}>MovieZone</span>
            <span className={styles.tagline}>Phim hay có PTITer</span>
          </div>
        </div>
        <div className={styles.searchWrap}>
          <SearchBox />
        </div>
        <nav className={styles.nav} aria-label="Chính">
          <NavLink to="#" className={styles.link}>
            Phim Lẻ
          </NavLink>
          <NavLink to="#" className={styles.link}>
            Phim Bộ
          </NavLink>
          <div className={styles.dropdown}>
            <button className={styles.dropBtn}>Thể loại ▾</button>
            <div className={styles.menu}>
              <button>Hành động</button>
              <button>Tâm lý</button>
              <button>Kịch tính</button>
            </div>
          </div>
          <div className={styles.dropdown}>
            <button className={styles.dropBtn}>Quốc gia ▾</button>
            <div className={styles.menu}>
              <button>Mỹ</button>
              <button>Hàn</button>
              <button>Nhật</button>
            </div>
          </div>
        </nav>

        <div className={styles.auth}>
          {AuthButtons} 
        </div>
      </div>
    </header>
  );
}
