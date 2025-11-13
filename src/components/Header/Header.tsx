import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBox from "../SearchBox/SearchBox";
import styles from "./Header.module.css";
import { useTheme } from "../Theme";

export default function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigator = () => navigate("/");

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
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
