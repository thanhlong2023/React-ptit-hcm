import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ViewAllPage.module.css";
import MovieCard from "../components/MovieSection/MovieCard";

// Define the shape of a movie object
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

const ViewAllPage = () => {
  const location = useLocation();
  const { title, apiUrl } = location.state || {
    title: "Không có dữ liệu",
    apiUrl: "",
  };

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async (pageNum: number) => {
    if (!apiUrl) return;
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const url = `${apiUrl}&api_key=${apiKey}&language=vi-VN&page=${pageNum}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.results) {
        setMovies((prevMovies) =>
          pageNum === 1 ? data.results : [...prevMovies, ...data.results]
        );
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when location changes
    setMovies([]);
    setPage(1);
    setHasMore(true);
    fetchMovies(1);
  }, [apiUrl]); // Re-run only when the category API URL changes

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage);
  };

  return (
    <div className={styles.viewAllPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>

      {movies.length > 0 ? (
        <div className={styles.movieGrid}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        !loading && <p>Không tìm thấy phim nào.</p>
      )}

      <div className={styles.loadMoreContainer}>
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className={styles.loadMoreButton}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewAllPage;
