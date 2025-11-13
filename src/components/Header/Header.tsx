import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBox from "../SearchBox/SearchBox";
import styles from "./Header.module.css";
import { Heart, LogOut, User, Sun, Moon } from "lucide-react";
import {
  getAuthToken,
  removeAuthToken,
  getStoredUserData,
} from "../../services/authService";
import { useTheme } from "../Theme";

export default function Header() {
  // 1. GỌI TẤT CẢ CÁC HOOKS TRÊN ĐẦU COMPONENT
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // State để theo dõi trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  // Quản lý tên người dùng
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // HOOK CẬP NHẬT TRẠNG THÁI VÀ TÊN NGƯỜI DÙNG
  useEffect(() => {
    const authenticated = !!getAuthToken();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const userData = getStoredUserData(); // Lấy dữ liệu user
      if (userData && userData.fullName) {
        setUserName(userData.fullName); // Lưu tên vào state
      }
    } else {
      setUserName("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUserName(""); // Xóa tên khi đăng xuất
    navigate("/");
  };

  // Logic đóng menu nếu click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const authContainer = document.querySelector(
        `.${styles.authDropdownContainer}`
      );
      if (authContainer && !authContainer.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  if (authPaths.includes(location.pathname)) {
    return null;
  }

  const navigator = () => navigate("/");

  // LOGIC HIỂN THỊ NÚT ĐĂNG NHẬP / DROPDOWN
  const AuthButtons = isAuthenticated ? (
    // KHI ĐÃ ĐĂNG NHẬP: HIỂN THỊ HÌNH TRÒN VÀ DROPDOWN
    <div className={styles.authDropdownContainer}>
      <button
        className={styles.profileButton}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-expanded={isMenuOpen}
      >
        <User size={24} color="#1b1f2f" />
      </button>

      {isMenuOpen && (
        <div
          className={styles.profileMenu}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          {/* HIỂN THỊ TÊN NGƯỜI DÙNG ĐANG ĐĂNG NHẬP */}
          <div className={styles.profileInfo}>
            <p className={styles.userName}>{userName || "Tài khoản"}</p>
          </div>

          <div className={styles.menuItems}>
            {/* YÊU THÍCH */}
            <NavLink
              to="/favorites"
              className={styles.menuItem}
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart size={18} /> Yêu thích
            </NavLink>

            {/* THOÁT (Đăng xuất) */}
            <button
              className={styles.menuItem}
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut size={18} /> Thoát
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    // KHI CHƯA ĐĂNG NHẬP: HIỂN THỊ NÚT ĐĂNG NHẬP BÌNH THƯỜNG
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
        <div className={styles.navWrapper}>
          <nav className={styles.nav} aria-label="Chính">
            <NavLink to="/movies" className={styles.link}>
              Phim Lẻ
            </NavLink>
            <NavLink to="/tv-series" className={styles.link}>
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

          <div className={styles.actions}>
            {AuthButtons}
            <button
              onClick={toggleTheme}
              className={styles.themeToggleButton}
              aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
            >
              {isDark ? (
                <Sun size={20} strokeWidth={2.5} />
              ) : (
                <Moon size={20} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
