/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import styles from "./FavoritesPage.module.css";
import { getFavoriteIds, getCurrentUserId } from "../services/authService";
import { AlertCircle } from "lucide-react";
import MovieCard from "../components/MovieSection/MovieCard";
import { useNavigate } from "react-router-dom";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function FavoritesPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const currentUserId = getCurrentUserId();
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // HÀM CALLBACK: Xử lý xóa phim khỏi STATE cục bộ ngay lập tức
  const handleMovieRemoved = (movieId: number) => {
    // Lọc ra phim có ID tương ứng để cập nhật giao diện
    setFavoriteMovies((prevMovies) =>
      prevMovies.filter((movie) => movie.id !== movieId)
    );
  };

  useEffect(() => {
    if (!currentUserId || !TMDB_API_KEY) {
      setError("Bạn chưa đăng nhập hoặc thiếu API Key.");
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy danh sách ID yêu thích từ DB (mô phỏng)
        const favoriteIds = await getFavoriteIds(currentUserId);

        if (favoriteIds.length === 0) {
          setFavoriteMovies([]);
          setLoading(false);
          return;
        }

        // 2. Lấy chi tiết từng phim từ TMDB API (song song)
        const moviePromises = favoriteIds.map((id) =>
          fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=vi-VN`
          ).then((res) => res.json())
        );

        const results = await Promise.all(moviePromises);

        if (!isCancelled) {
          // Lọc ra các phim hợp lệ (tránh các lỗi 404 từ TMDB)
          const validMovies: Movie[] = results
            .filter((data) => data && data.poster_path)
            .map((data) => ({
              id: data.id,
              title: data.title,
              poster_path: data.poster_path,
              vote_average: data.vote_average,
              release_date: data.release_date || "",
            }));

          setFavoriteMovies(validMovies);
        }
      } catch (e) {
        if (!isCancelled) {
          setError("Lỗi khi tải danh sách phim.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId, TMDB_API_KEY]);

  // === RENDER LOGIC ===

  if (loading) {
    return (
      <div className={styles.favoritesRoot}>
        Đang tải danh sách phim yêu thích...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.favoritesRoot}>
        <div className={styles.errorBox}>
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (favoriteMovies.length === 0) {
    return (
      <div className={`${styles.favoritesRoot} ${styles.emptyState}`}>
        <h2>Danh sách Yêu thích đang trống</h2>
        <p>
          Hãy thêm các bộ phim bạn muốn xem sau bằng cách nhấp vào biểu tượng
          trái tim.
        </p>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className={styles.favoritesRoot}>
      <h2 className={styles.pageTitle}>
        Danh sách Yêu thích ({favoriteMovies.length})
      </h2>

      <div className={styles.moviesGrid}>
        {favoriteMovies.map((movie) => (
          // TRUYỀN HÀM CALLBACK onFavoriteRemoved VÀO MOVIECARD
          <MovieCard
            key={movie.id}
            movie={movie}
            onFavoriteRemoved={handleMovieRemoved}
          />
        ))}
      </div>
    </div>
  );
}
