import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./SearchPage.module.css";
import MovieCard from "../components/MovieSection/MovieCard";
import PersonCard from "../components/PersonCard/PersonCard";

// Define the shape of a result object from search
interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  profile_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
  media_type: "movie" | "tv" | "person";
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"movies" | "people">("movies");

  const fetchResults = async (pageNum: number) => {
    if (!query) return;
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=vi-VN&page=${pageNum}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.results) {
        setResults((prevResults) =>
          pageNum === 1 ? data.results : [...prevResults, ...data.results]
        );
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    fetchResults(1);
  }, [query]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage);
  };

  const movieResults = useMemo(
    () =>
      results.filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          item.poster_path
      ),
    [results]
  );

  const personResults = useMemo(
    () =>
      results.filter(
        (item) => item.media_type === "person" && item.profile_path
      ),
    [results]
  );

  const adaptToMovieCard = (result: SearchResult) => ({
    id: result.id,
    title: result.title || result.name || "No Title",
    poster_path: result.poster_path || "",
    vote_average: result.vote_average || 0,
    release_date: result.release_date || result.first_air_date || "",
  });

  const renderGrid = () => {
    if (activeTab === "movies") {
      if (movieResults.length === 0) return <p className={styles.noResults}>Không tìm thấy phim hoặc series nào.</p>;
      return (
        <div className={styles.resultsGrid}>
          {movieResults.map((result) => (
            <MovieCard
              key={`${result.media_type}-${result.id}`}
              movie={adaptToMovieCard(result)}
            />
          ))}
        </div>
      );
    }

    if (activeTab === "people") {
      if (personResults.length === 0) return <p className={styles.noResults}>Không tìm thấy diễn viên hoặc đạo diễn nào.</p>;
      return (
        <div className={styles.resultsGrid}>
          {personResults.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.searchPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Kết quả cho:</h1>
        <span className={styles.queryText}>{query}</span>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "movies" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("movies")}
        >
          Phim & Series ({movieResults.length})
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "people" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("people")}
        >
          Mọi người ({personResults.length})
        </button>
      </div>

      {!loading && results.length === 0 ? (
         <p className={styles.noResults}>Không tìm thấy kết quả nào phù hợp.</p>
      ) : renderGrid()}

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

export default SearchPage;
