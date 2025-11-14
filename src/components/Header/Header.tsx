/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface Genre {
  id: number;
  name: string;
}

export default function Header() {
  // 1. GỌI TẤT CẢ CÁC HOOKS TRÊN ĐẦU COMPONENT
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  // State để theo dõi trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  // Quản lý tên người dùng
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lấy tên người dùng từ localStorage khi component mount
  useEffect(() => {
    if (isAuthenticated) {
      const userData = localStorage.getItem("user_data")
        ? JSON.parse(localStorage.getItem("user_data") || "{}")
        : null;
      if (userData?.fullName) {
        setUserName(userData.fullName);
      }
    }
  }, [isAuthenticated]);

  const { isDark, toggleTheme } = useTheme();

  // Hook xử lý cuộn trang để đổi màu Header
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch genres
  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=vi-VN`
    )
      .then((res) => res.json())
      .then((data) => setGenres(data.genres?.slice(0, 8) || []))
      .catch((err) => console.error("Error fetching genres:", err));
  }, []);

  const navigator = () => navigate("/");

  const handleGenreClick = (genreId: number) => {
    navigate(`/search?genre=${genreId}`);
  };

  const handleCountryClick = (country: string) => {
    navigate(`/search?country=${country}`);
  };

  // Buttons đăng nhập/đăng xuất (nếu bạn có logic này)
  const AuthButtons = isAuthenticated ? (
    <div className={styles.authDropdownContainer}>
      <button
        className={styles.userButton}
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
        title={userName}
      >
        <User size={20} />
      </button>
      {isMenuOpen && (
        <div
          className={styles.userDropdown}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <div className={styles.userInfo}>
            <span className={styles.userNameText}>
              {userName || "Người dùng"}
            </span>
          </div>
          <button
            className={styles.dropdownItem}
            onClick={() => {
              navigate("/favorites");
              setIsMenuOpen(false);
            }}
          >
            <Heart size={16} />
            <span>Danh sách yêu thích</span>
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => {
              removeAuthToken();
              setUserName("");
              setIsAuthenticated(false);
              setIsMenuOpen(false);
              navigate("/");
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  ) : (
    <button className={styles.loginButton} onClick={() => navigate("/login")}>
      <User size={18} /> Đăng nhập
    </button>
  );

  return (
    <header className={`${styles.header} ${scrolled ? styles.solid : ""}`}>
      <div className={styles.inner}>
        {/* LOGO */}
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

        {/* THANH TÌM KIẾM */}
        <div className={styles.searchWrap}>
          <SearchBox />
        </div>

        {/* THANH ĐIỀU HƯỚNG */}
        <nav className={styles.nav} aria-label="Chính">
          <button
            className={styles.link}
            onClick={() => navigate("/search?type=movie")}
          >
            Phim Lẻ
          </button>
          <button
            className={styles.link}
            onClick={() => navigate("/search?type=tv")}
          >
            Phim Bộ
          </button>

          {/* MENU THỂ LOẠI */}
          <div className={styles.dropdown}>
            <button className={styles.dropBtn}>Thể loại ▾</button>
            <div className={styles.menu}>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* MENU QUỐC GIA */}
          <div className={styles.dropdown}>
            <button className={styles.dropBtn}>Quốc gia ▾</button>
            <div className={styles.menu}>
              <button onClick={() => handleCountryClick("US")}>Mỹ</button>
              <button onClick={() => handleCountryClick("KR")}>Hàn Quốc</button>
              <button onClick={() => handleCountryClick("CN")}>
                Trung Quốc
              </button>
              <button onClick={() => handleCountryClick("JP")}>Nhật Bản</button>
              <button onClick={() => handleCountryClick("TH")}>Thái Lan</button>
              <button onClick={() => handleCountryClick("GB")}>Anh</button>
            </div>
          </div>
        </nav>

        {/* CÁC NÚT BÊN PHẢI */}
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
    </header>
  );
}
