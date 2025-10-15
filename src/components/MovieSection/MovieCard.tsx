import styles from "./MovieCard.module.css";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  const goDetail = () => navigate(`/movie/${movie.id}`);
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
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : "/no-poster.png"
          }
          alt={movie.title}
          loading="lazy"
        />
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{movie.title}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <Star size={14} /> {movie.vote_average.toFixed(1)}
          </span>
          <span className={styles.year}>
            {movie.release_date?.split("-")[0] || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
