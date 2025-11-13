import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBox.module.css"; // dùng CSS module

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Effect để xử lý click ngoài component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
            query
          )}&language=vi-VN`
        );
        const data = await res.json();
        // Lọc kết quả, chỉ lấy phim (movie) và show truyền hình (tv)
        const filteredResults = data.results?.filter(
          (item: any) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            item.poster_path
        );
        setResults(filteredResults || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching multi-search:", err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectResult = (result: any) => {
    setShowDropdown(false);
    setQuery("");
    // Chuyển hướng đến trang chi tiết của phim hoặc show truyền hình
    navigate(`/${result.media_type}/${result.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim()) {
      setShowDropdown(false);
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      // Không cần setQuery('') ở đây để người dùng thấy lại từ khóa trên trang tìm kiếm nếu cần
    }
  };

  return (
    <div className={styles.searchBox} ref={searchBoxRef}>
      <input
        type="text"
        placeholder="Tìm phim, series, diễn viên..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className={styles.input}
      />

      {showDropdown && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.slice(0, 8).map((result) => (
            <li
              key={result.id}
              className={styles.item}
              onClick={() => handleSelectResult(result)}
            >
              {result.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                  alt={result.title || result.name}
                  className={styles.poster}
                />
              )}
              <span className={styles.title}>{result.title || result.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
