import { useEffect, useState } from "react";
import MovieCard from "../MovieSection/MovieCard";
import styles from "./FilteredTVSeriesGrid.module.css";

interface TVSeries {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface FilteredTVSeriesGridProps {
  sortBy: string;
  type: string;
  genre: string;
  country: string;
  language: string;
  year: string;
}

export default function FilteredTVSeriesGrid({
  sortBy,
  type,
  genre,
  country,
  language,
  year,
}: FilteredTVSeriesGridProps) {
  const [series, setSeries] = useState<TVSeries[]>([]);
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

    // Sort mapping
    const sortMap: { [key: string]: string } = {
      "Mới Lên Sóng": "first_air_date.desc",
      "Phổ biến": "popularity.desc",
      "Mới cập nhật": "last_air_date.desc",
    };
    params.append("sort_by", sortMap[sortBy] || "popularity.desc");

    // Genre mapping (TMDB genre IDs for TV)
    const genreMap: { [key: string]: string } = {
      "Phim Bộ": "",
      "Hành động": "10759",
      "Kinh dị": "9648",
      "Hài hước": "35",
    };
    if (genreMap[genre]) {
      params.append("with_genres", genreMap[genre]);
    }

    // Year filter
    if (year !== "Tất cả") {
      params.append("first_air_date_year", year);
    }

    // Language filter
    const langMap: { [key: string]: string } = {
      Việt: "vi",
      Anh: "en",
      Hàn: "ko",
    };
    if (langMap[language] && language !== "Tất cả") {
      params.append("with_original_language", langMap[language]);
    }

    const url = `https://api.themoviedb.org/3/discover/tv?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Map TV series results to Movie interface format for MovieCard compatibility
        const mappedSeries = (data.results || []).slice(0, 20).map((tv: Record<string, unknown>) => ({
          id: tv.id as number,
          title: tv.name as string,
          poster_path: tv.poster_path as string,
          vote_average: tv.vote_average as number,
          release_date: tv.first_air_date as string,
        }));
        setSeries(mappedSeries);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching TV series:", error);
        setLoading(false);
      });
  }, [sortBy, type, genre, country, language, year]);

  if (loading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.loadingText}>Đang tải phim bộ...</div>
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.noResults}>
          Không tìm thấy phim bộ phù hợp với bộ lọc của bạn
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {series.map((tv) => (
          <div key={tv.id} className={styles.gridItem}>
            <MovieCard movie={tv} />
          </div>
        ))}
      </div>
    </div>
  );
}
