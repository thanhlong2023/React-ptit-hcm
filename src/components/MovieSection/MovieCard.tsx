import styles from "./MovieCard.module.css";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAuthToken,
  getCurrentUserId,
  toggleFavorite,
  getFavoriteIds,
} from "../../services/authService";

interface MovieCardProps {
  movie: {
    id: number;
    title?: string; // For movies
    name?: string; // For TV shows
    poster_path: string;
    vote_average: number;
    release_date?: string; // For movies
    first_air_date?: string; // For TV shows
  };
  // NEW PROP: Hàm callback cho trang Favorites
  onFavoriteRemoved?: (movieId: number) => void;
}

export default function MovieCard({
  movie,
  onFavoriteRemoved,
}: MovieCardProps) {
  // NHẬN PROP MỚI
  const navigate = useNavigate();
  // Navigate to movie or tv detail page based on presence of title/name
  const detailPath = movie.title ? `/movie/${movie.id}` : `/tv/${movie.id}`;
  const goDetail = () => navigate(detailPath);

  const currentUserId = getCurrentUserId();

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      setIsFavorite(false);
      return;
    }

    getFavoriteIds(currentUserId)
      .then((favoriteIds) => {
        setIsFavorite(favoriteIds.includes(movie.id));
      })
      .catch((error) => {
        console.error("Lỗi tải trạng thái yêu thích:", error);
      });
  }, [currentUserId, movie.id]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!getAuthToken() || !currentUserId) {
      navigate("/login?redirect=/");
      return;
    }

    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    const success = await toggleFavorite(currentUserId, movie.id, newStatus);

    if (success) {
      // LOGIC: Nếu xóa (newStatus là false) VÀ đang ở trang Favorites, gọi callback
      if (!newStatus && onFavoriteRemoved) {
        onFavoriteRemoved(movie.id);
      }
    } else {
      // Nếu API thất bại, rollback
      setIsFavorite(!newStatus);
      console.error("Lỗi: Không thể cập nhật danh sách yêu thích trên DB.");
    }
  };

  const title = movie.title || movie.name;
  const releaseYear = (movie.release_date || movie.first_air_date)?.split("-")[0] || "N/A";

  return (
    <div
      className={styles.card}
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
    >
      <div className={styles.imageBox}>
        <div
          className={`${styles.favoriteToggle} ${
            isFavorite ? styles.isFavorited : ""
          }`}
          onClick={handleFavoriteToggle}
        >
          <Heart
            size={20}
            className={`${styles.heartIcon} ${isFavorite ? styles.active : ""}`}
            fill={isFavorite ? "#ff3847" : "none"}
          />
        </div>
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : "/no-poster.png"
          }
          alt={title}
          loading="lazy"
        />
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <Star size={14} /> {movie.vote_average.toFixed(1)}
          </span>
          <span className={styles.year}>
            {releaseYear}
          </span>
        </div>
      </div>
    </div>
  );
}
