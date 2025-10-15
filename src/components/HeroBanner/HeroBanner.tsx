import { useEffect, useState, useMemo } from "react";
import styles from "./HeroBanner.module.css";

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
        const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`;
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

  useEffect(() => {
    if (filtered.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % filtered.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [filtered.length]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Lỗi tải dữ liệu: {error}</div>;
  if (filtered.length === 0) return <div>Không có dữ liệu phim hợp lệ.</div>;

  const movie = filtered[current];
  const bgSrc = movie.backdrop_path
    ? `${IMG}${movie.backdrop_path}`
    : "/fallback.jpg";

  return (
    <div className={styles.poster}>
      <img
        className={styles.background}
        src={bgSrc}
        alt="" /* ảnh nền mang tính trang trí */
        aria-hidden="true"
      />
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1>{movie.title}</h1>
        {movie.original_title && movie.original_title !== movie.title && (
          <p>{movie.original_title}</p>
        )}
        {movie.overview && <p className={styles.desc}>{movie.overview}</p>}
        <button className={styles.play}>▶ Xem ngay</button>
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
