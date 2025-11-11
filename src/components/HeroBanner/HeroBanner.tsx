import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import styles from "./HeroBanner.module.css";
import { useNavigate } from "react-router";
import { getAuthToken } from "../../services/authService";

export interface Movie {
  id: number;
  title?: string;
  original_title?: string;
  backdrop_path?: string | null;
  overview?: string;
}

const IMG = "https://image.tmdb.org/t/p/original";

export default function HeroBanner() {
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const VISIBLE_COUNT = 4; // số thumbnail hiển thị

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiKey =
          import.meta.env.VITE_TMDB_API_KEY ||
          "2312b7734c4449f7fe8ddaf462ec1141"; // fallback nếu chưa cấu hình env
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=vi-VN`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (!data || !Array.isArray(data.results))
          throw new Error("Sai định dạng dữ liệu");
        if (!cancelled) setNowPlaying(data.results);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lọc những item có đủ dữ liệu hiển thị
  const filtered: Movie[] = useMemo(
    () =>
      (nowPlaying as Movie[]).filter((m) => m && m.backdrop_path && m.title),
    [nowPlaying]
  );

  // Map id -> index để tra nhanh khi render window
  const indexMap = useMemo(() => {
    const map = new Map<number, number>();
    filtered.forEach((m, i) => map.set(m.id, i));
    return map;
  }, [filtered]);

  // Lấy 1 cửa sổ 4 phần tử sao cho current là vị trí thứ 2 (index 1) trong cửa sổ
  const visible = useMemo(() => {
    if (filtered.length <= VISIBLE_COUNT) return filtered;
    const start = (current - 1 + filtered.length) % filtered.length;
    const arr: Movie[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      arr.push(filtered[(start + i) % filtered.length]);
    }
    return arr;
  }, [filtered, current]);

  // Reset index khi danh sách đổi
  useEffect(() => {
    setCurrent(0);
  }, [filtered.length]);

  // Auto-advance: dùng timeout để luôn đủ 4s sau mỗi lần user click
  const timeoutRef = useRef<number | null>(null);
  const scheduleNext = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (filtered.length === 0) return;
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % filtered.length);
    }, 4000);
  }, [filtered.length]);

  // Mỗi khi current thay đổi (do click hoặc auto) lên lịch lại 4s
  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, scheduleNext]);

  // Khi list đổi, reset timer
  useEffect(() => {
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filtered.length, scheduleNext]);

  const navigate = useNavigate();

  // Xử lý nút "Xem ngay" (Kiểm tra Auth)
  const handleWatchNow = (movieId: number) => {
    if (getAuthToken()) {
      // Đã đăng nhập: Chuyển đến trang chi tiết
      navigate(`/movie/${movieId}`);
    } else {
      // Chưa đăng nhập: Chuyển đến trang Đăng nhập và thêm redirect path
      navigate(`/login?redirect=/movie/${movieId}`);
    }
  };

  if (loading)
    return (
      <div className={styles.poster}>
        <div className={styles.overlay}></div>
        <div className={styles.skelTitle}></div>
        <div className={styles.skelLines}>
          <div className={styles.skelLine}></div>
          <div className={styles.skelLine}></div>
          <div className={styles.skelLineShort}></div>
        </div>
        <div className={styles.skelThumbRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skelThumb}></div>
          ))}
        </div>
      </div>
    );
  if (error) return <div>Lỗi tải dữ liệu: {error}</div>;
  if (filtered.length === 0) return <div>Không có dữ liệu phim hợp lệ.</div>;

  const movie = filtered[current];
  const bgSrc = movie.backdrop_path
    ? `${IMG}${movie.backdrop_path}`
    : "/fallback.jpg";

  return (
    <div className={styles.poster}>
      <img
        key={current}
        className={`${styles.background} ${styles.fadeImage}`}
        src={bgSrc}
        alt="" /* ảnh nền mang tính trang trí */
        aria-hidden="true"
      />
      <div className={styles.overlay}></div>

      <div
        key={current + "-content"}
        className={`${styles.content} ${styles.fadeContent}`}
      >
        <h1>{movie.title}</h1>
        {movie.original_title && movie.original_title !== movie.title && (
          <p>{movie.original_title}</p>
        )}
        {movie.overview && <p className={styles.desc}>{movie.overview}</p>}

        {/* Gọi hàm kiểm tra Auth */}
        <button
          className={styles.play}
          onClick={() => handleWatchNow(movie.id)}
        >
          ▶ Xem ngay
        </button>
      </div>

      <div className={styles.thumbnails}>
        {visible.map((m) => {
          const originalIndex = indexMap.get(m.id)!;
          const thumb = m.backdrop_path
            ? `${IMG}${m.backdrop_path}`
            : "/fallback-thumb.jpg";
          const isActive = originalIndex === current;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setCurrent(originalIndex)}
              className={`${styles.thumbBtn} ${isActive ? styles.active : ""}`}
              aria-label={`Xem ${m.title}`}
            >
              <img
                src={thumb}
                alt={m.title}
                className={styles.thumbImg}
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
