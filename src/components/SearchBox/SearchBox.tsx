import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import styles from "./SearchBox.module.css";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
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

  // Fetch autocomplete results
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
        setResults(data.results?.slice(0, 6) || []); // Chỉ lấy 6 kết quả
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching multi-search:", err);
      }
    }, 300); // Giảm debounce xuống 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search page with query parameter
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(""); // Clear input after search
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelectMovie = (movie: Movie) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/movie/${movie.id}`); // Đi thẳng đến trang chi tiết phim
  };

  const handleInputFocus = () => {
    if (query && results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay để cho phép click vào dropdown
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={styles.searchWrapper}>
      <form onSubmit={handleSearch} className={styles.searchBox}>
        <input
          type="text"
          placeholder="Tìm phim theo tên, diễn viên"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={styles.input}
        />
        <button type="submit" className={styles.searchBtn}>
          <Search size={18} />
        </button>
      </form>

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((movie) => (
            <div
              key={movie.id}
              className={styles.dropdownItem}
              onClick={() => handleSelectMovie(movie)}
            >
              <div className={styles.posterWrapper}>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                    alt={movie.title}
                    className={styles.poster}
                  />
                ) : (
                  <div className={styles.noPoster}>
                    🎬
                  </div>
                )}
              </div>
              
              <div className={styles.movieInfo}>
                <div className={styles.movieTitle}>{movie.title}</div>
              </div>
            </div>
          ))}
          
          {/* "Xem tất cả" option */}
          <div 
            className={styles.dropdownItem + ' ' + styles.seeAll}
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              setShowDropdown(false);
              setQuery("");
            }}
          >
            <Search size={16} />
            <span>Xem tất cả kết quả cho "{query}"</span>
          </div>
        </div>
      )}
    </div>
  );
}
