import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MovieDetail.module.css";
import {
  CalendarDays,
  Clock,
  Tags,
  AlertCircle,
  Heart,
  BookOpen,
  Users,
} from "lucide-react";
import {
  getAuthToken,
  getCurrentUserId,
  toggleFavorite,
  getFavoriteIds,
} from "../../services/authService";

interface MovieDetailProps {
  movieId: number;
}

interface Genre {
  id: number;
  name: string;
}
interface MovieData {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  genres: Genre[];
  release_date: string;
  runtime?: number;
  vote_average?: number;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
interface VideoItem {
  id: string;
  key: string;
  site: string;
  type: string;
}

export default function MovieDetail({ movieId }: MovieDetailProps) {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError("Thiếu biến môi trường VITE_TMDB_API_KEY");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const base = `https://api.themoviedb.org/3/movie/${movieId}`;
        const qs = `?api_key=${apiKey}`;
        const [movieRes, videoRes, castRes] = await Promise.all([
          fetch(`${base}${qs}&language=vi-VN`),
          fetch(`${base}/videos${qs}&language=en-US`),
          fetch(`${base}/credits${qs}&language=vi-VN`),
        ]);
        if (!movieRes.ok) throw new Error("Không tải được thông tin phim");
        const movieData: MovieData = await movieRes.json();
        const videoData: { results?: VideoItem[] } = await videoRes.json();
        const creditsData: { cast?: Cast[] } = await castRes.json();
        if (cancelled) return;
        setMovie(movieData);
        const trailer = videoData.results?.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        setTrailerKey(trailer ? trailer.key : null);
        setCast((creditsData.cast || []).slice(0, 10));
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  // Check if movie is favorited
  useEffect(() => {
    if (!currentUserId) {
      setIsFavorite(false);
      return;
    }

    getFavoriteIds(currentUserId)
      .then((favoriteIds) => {
        setIsFavorite(favoriteIds.includes(movieId));
      })
      .catch((error) => {
        console.error("Lỗi tải trạng thái yêu thích:", error);
      });
  }, [currentUserId, movieId]);

  const handleFavoriteToggle = async () => {
    if (!getAuthToken() || !currentUserId) {
      navigate("/login?redirect=/");
      return;
    }

    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    const success = await toggleFavorite(currentUserId, movieId, newStatus);

    if (!success) {
      // Nếu API thất bại, rollback
      setIsFavorite(!newStatus);
      console.error("Lỗi: Không thể cập nhật danh sách yêu thích trên DB.");
    }
  };

  const genreNames = useMemo(
    () => movie?.genres.map((g) => g.name).join(", ") || "",
    [movie]
  );

  if (loading) {
    return (
      <div className={styles.detailRoot}>
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonBlock} />
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.detailRoot}>
        <div className={styles.errorBoxWrapper}>
          <div className={styles.errorBox}>
            <AlertCircle size={32} />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!movie) return null;

  return (
    <div className={styles.detailRoot}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBgWrapper}>
          {(movie.backdrop_path || movie.poster_path) && (
            <img
              src={`https://image.tmdb.org/t/p/original${
                movie.backdrop_path || movie.poster_path
              }`}
              alt={movie.title}
              className={styles.heroBg}
              loading="lazy"
            />
          )}
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          {movie.poster_path && (
            <div className={styles.posterShell}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className={styles.poster}
                loading="lazy"
              />
              {movie.vote_average && (
                <div className={styles.scoreBadge}>
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </div>
          )}
          <div className={styles.meta}>
            <h1 className={styles.title}>{movie.title}</h1>
            {movie.original_title !== movie.title && (
              <h2 className={styles.original}>{movie.original_title}</h2>
            )}
            <div className={styles.icons}>
              {genreNames && (
                <span>
                  <Tags size={18} /> {genreNames}
                </span>
              )}
              <span>
                <CalendarDays size={18} /> {movie.release_date}
              </span>
              {movie.runtime && (
                <span>
                  <Clock size={18} /> {movie.runtime} phút
                </span>
              )}
            </div>
            <button
              className={`${styles.favoriteBtn} ${
                isFavorite ? styles.active : ""
              }`}
              onClick={handleFavoriteToggle}
              title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart
                size={20}
                fill={isFavorite ? "#ff3847" : "none"}
                color={isFavorite ? "#ff3847" : "currentColor"}
              />
              {isFavorite ? "Đã thích" : "Thêm vào yêu thích"}
            </button>
          </div>
        </div>
      </section>

      {/* ===== TRAILER ===== */}
      {trailerKey && (
        <div className={styles.trailerSection}>
          <div className={styles.aspectBox}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="Trailer"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <section className={styles.content}>
        <h3 className={styles.sectionHeading}>
          <BookOpen size={20} /> Nội dung phim
        </h3>
        <p className={styles.overview}>{movie.overview}</p>
      </section>

      {/* ===== CAST ===== */}
      {cast.length > 0 && (
        <section className={styles.castSection}>
          <h3 className={styles.sectionHeading}>
            <Users size={20} /> Diễn viên
          </h3>
          <div className={styles.castGrid}>
            {cast.map((actor) => (
              <div
                key={actor.id}
                className={styles.castCard}
                onClick={() => navigate(`/person/${actor.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/person/${actor.id}`)
                }
              >
                <div className={styles.castImgWrap}>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "/no-avatar.png"
                    }
                    alt={actor.name}
                    loading="lazy"
                  />
                </div>
                <p className={styles.actorName}>{actor.name}</p>
                <p className={styles.actorRole}>{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
