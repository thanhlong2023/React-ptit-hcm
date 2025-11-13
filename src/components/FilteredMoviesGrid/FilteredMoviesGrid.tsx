import { useEffect, useState } from "react";
import MovieCard from "../MovieSection/MovieCard";
import styles from "./FilteredMoviesGrid.module.css";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface FilteredMoviesGridProps {
  sortBy: string;
  type: string;
  genre: string;
  country: string;
  language: string;
  year: string;
}

export default function FilteredMoviesGrid({
  sortBy,
  type,
  genre,
  country,
  language,
  year,
}: FilteredMoviesGridProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    setLoading(true);

    // Build query params based on filters
    const params = new URLSearchParams();
    params.append("api_key", apiKey);
    params.append("language", "vi-VN");
    params.append("page", "1");
    params.append("region", "VN");

    // Sort mapping
    const sortMap: { [key: string]: string } = {
      "Mới Lên Sóng": "primary_release_date.desc",
      "Phổ biến": "popularity.desc",
      "Mới cập nhật": "release_date.desc",
    };
    params.append("sort_by", sortMap[sortBy] || "popularity.desc");

    // Genre mapping (TMDB genre IDs)
    const genreMap: { [key: string]: string } = {
      "Phim Lẻ": "",
      "Hành động": "28",
      "Kinh dị": "27",
      "Hài hước": "35",
    };
    if (genreMap[genre]) {
      params.append("with_genres", genreMap[genre]);
    }

    // Year filter
    if (year !== "Tất cả") {
      params.append("year", year);
    }

    // Language filter (using original_language)
    const langMap: { [key: string]: string } = {
      Việt: "vi",
      Anh: "en",
      Hàn: "ko",
    };
    if (langMap[language] && language !== "Tất cả") {
      params.append("with_original_language", langMap[language]);
    }

    const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results?.slice(0, 20) || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setLoading(false);
      });
  }, [sortBy, type, genre, country, language, year]);

  if (loading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.loadingText}>Đang tải phim...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.noResults}>
          Không tìm thấy phim phù hợp với bộ lọc của bạn
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {movies.map((movie) => (
          <div key={movie.id} className={styles.gridItem}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
