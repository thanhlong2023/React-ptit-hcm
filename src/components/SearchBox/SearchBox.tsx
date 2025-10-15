import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBox.module.css"; // dùng CSS module

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // gọi API TMDB khi người dùng dừng gõ 0.5s
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectMovie = (movie: any) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/movie/${movie.id}`); // sang trang chi tiết
  };

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        placeholder="Tìm phim theo tên, diễn viên"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowDropdown(true)}
        className={styles.input}
      />

      {showDropdown && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.slice(0, 8).map((movie) => (
            <li
              key={movie.id}
              className={styles.item}
              onClick={() => handleSelectMovie(movie)}
            >
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className={styles.poster}
                />
              )}
              <span className={styles.title}>{movie.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
