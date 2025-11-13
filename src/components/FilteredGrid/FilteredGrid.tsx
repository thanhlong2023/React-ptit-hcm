import { useEffect, useState, useMemo } from "react";
import MovieCard from "../MovieSection/MovieCard";
import styles from "./FilteredGrid.module.css"; // Reusing the same CSS

// A generic interface that covers both movies and TV shows
interface MediaItem {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  poster_path: string;
  vote_average: number;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
}

interface FilteredGridProps {
  type: 'movie' | 'tv';
  genreId?: string;
  genreName?: string;
  countryCode?: string;
  countryName?: string;
  sortBy?: string;
  year?: string;
  language?: string;
}

export default function FilteredGrid({
  type,
  genreId,
  genreName,
  countryCode,
  countryName,
  sortBy,
  year,
  language,
}: FilteredGridProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMedia = async (pageNum: number) => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    setLoading(true);

    const params = new URLSearchParams();
    params.append("api_key", apiKey);
    params.append("language", "vi-VN");
    params.append("page", pageNum.toString());
    params.append("sort_by", "popularity.desc"); // Default sort

    if (sortBy) {
      const sortMap: { [key: string]: string } = {
        "Mới Lên Sóng": type === 'movie' ? "primary_release_date.desc" : "first_air_date.desc",
        "Phổ biến": "popularity.desc",
        "Mới cập nhật": "release_date.desc",
      };
      params.set("sort_by", sortMap[sortBy] || "popularity.desc");
    }

    if (genreId) {
      params.append("with_genres", genreId);
    }
    if (countryCode && type === 'movie') { // Country filter only works for movies
      params.append("with_origin_country", countryCode);
    }
    if (year && year !== "Tất cả") {
      const yearParam = type === 'movie' ? "primary_release_year" : "first_air_date_year";
      params.append(yearParam, year);
    }
    if (language) {
      const langMap: { [key: string]: string } = {
        "Việt": "vi",
        "Anh": "en",
        "Hàn": "ko",
        "Nhật": "ja",
      };
      if (langMap[language]) {
        params.append("with_original_language", langMap[language]);
      }
    }

    const apiUrl = `https://api.themoviedb.org/3/discover/${type}?${params.toString()}`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.results) {
        setItems((prevItems) =>
          pageNum === 1 ? data.results : [...prevItems, ...data.results]
        );
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchMedia(1);
  }, [type, genreId, countryCode, sortBy, year, language]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage);
  };

  const displayTitle = useMemo(() => {
    if (genreName) return `${type === 'movie' ? 'Phim lẻ' : 'Phim bộ'} theo thể loại: ${genreName}`;
    if (countryName) return `Phim từ quốc gia: ${countryName}`;
    return "Kết quả lọc";
  }, [type, genreName, countryName]);

  if (loading && items.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.loadingText}>Đang tải...</div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.noResults}>
          Không tìm thấy kết quả phù hợp.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <h2 className={styles.sectionTitle}>{displayTitle}</h2>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.gridItem}>
            <MovieCard movie={item} />
          </div>
        ))}
      </div>
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
}
