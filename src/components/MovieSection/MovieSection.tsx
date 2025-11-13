import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./MovieSection.module.css";
import MovieCard from "./MovieCard";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MovieSectionProps {
  title: string;
  apiUrl: string; // endpoint TMDB
}

export default function MovieSection({ title, apiUrl }: MovieSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    fetch(`${apiUrl}&api_key=${apiKey}&language=vi-VN`)
      .then((res) => res.json())
      .then((data) => setMovies(data.results?.slice(0, 10) || []));
  }, [apiUrl]);

  // after movies load, evaluate scroll buttons
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 10);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [movies.length]);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Estimate card width (including gap) from first child
    const first = el.querySelector(
      `.${styles.cardWrapper}`
    ) as HTMLElement | null;
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    const target = el.scrollLeft + dir * step * 1.2; // a bit more than 1 card
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  const handleViewAll = () => {
    navigate("/view-all", { state: { title, apiUrl } });
  };

  if (movies.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <div></div>
        </div>
        <div className={styles.carouselWrap}>
          <div className={styles.scroller}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.cardWrapper}>
                <div className={styles.skelPoster}></div>
                <div className={styles.skelBar}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <button className={styles.viewAll} onClick={handleViewAll}>
          Xem toàn bộ <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.carouselWrap}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.prev}`}
          onClick={() => scrollByCards(-1)}
          disabled={!canPrev}
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        <div className={styles.scroller} ref={scrollerRef}>
          {movies.map((movie) => (
            <div key={movie.id} className={styles.cardWrapper}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.next}`}
          onClick={() => scrollByCards(1)}
          disabled={!canNext}
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

