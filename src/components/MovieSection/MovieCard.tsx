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
}

export default function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  // Navigate to movie or tv detail page based on presence of title/name
  const detailPath = movie.title ? `/movie/${movie.id}` : `/tv/${movie.id}`;
  const goDetail = () => navigate(detailPath);

  // Lấy ID người dùng hiện tại
  const currentUserId = getCurrentUserId();

  // STATE: Quản lý trạng thái trái tim (Khởi tạo là false)
  const [isFavorite, setIsFavorite] = useState(false);

  // HOOK: Tải trạng thái yêu thích ban đầu từ DB
  useEffect(() => {
    // Chỉ chạy nếu người dùng đã đăng nhập
    if (!currentUserId) return;

    getFavoriteIds(currentUserId)
      .then((favoriteIds) => {
        // Kiểm tra xem ID phim hiện tại có trong mảng DB không
        setIsFavorite(favoriteIds.includes(movie.id));
      })
      .catch((error) => {
        console.error("Lỗi tải trạng thái yêu thích:", error);
      });

    // Phụ thuộc vào ID phim và ID người dùng
  }, [currentUserId, movie.id]);

  // HÀM XỬ LÝ KHI CLICK VÀO TRÁI TIM
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    // Ngăn chặn sự kiện click lan truyền lên div cha, tránh mở trang chi tiết
    e.stopPropagation();

    if (!getAuthToken() || !currentUserId) {
      // CHƯA ĐĂNG NHẬP: Chuyển hướng đến trang Login
      navigate("/login?redirect=/");
      return;
    }

    // Logic xử lý DB (Optimistic Update)
    const newStatus = !isFavorite;
    setIsFavorite(newStatus); // Cập nhật giao diện ngay lập tức

    // Gọi API để cập nhật DB
    const success = await toggleFavorite(currentUserId, movie.id, newStatus);

    if (!success) {
      // Nếu API thất bại, rollback lại trạng thái cũ
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
        {/* ICON TRÁI TIM */}
        <div
          className={`${styles.favoriteToggle} ${
            isFavorite ? styles.isFavorited : ""
          }`} // Áp dụng isFavorited vào thẻ DIV cha
          onClick={handleFavoriteToggle}
        >
          <Heart
            size={20}
            // Dùng class active để chuyển màu đỏ
            className={`${styles.heartIcon} ${isFavorite ? styles.active : ""}`}
            // Đổ đầy trái tim khi là yêu thích
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
