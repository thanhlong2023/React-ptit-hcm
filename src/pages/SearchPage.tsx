import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./SearchPage.module.css";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get search parameters
  const query = searchParams.get("q") || "";
  const selectedGenre = searchParams.get("genre") || "";
  const selectedCountry = searchParams.get("country") || "";
  const selectedType = searchParams.get("type") || "movie"; // Default to movie
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState(selectedGenre);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState(selectedCountry);
  const [selectedYear, setSelectedYear] = useState("");
  const [showFilters, setShowFilters] = useState(
    Boolean(query || selectedGenre || selectedCountry || (selectedType && selectedType !== "movie")) // Mở filter nếu có params
  );

  // Genre mapping
  const genreNames: Record<string, string> = {
    "28": "Hành động",
    "12": "Phiêu lưu", 
    "16": "Hoạt hình",
    "35": "Hài",
    "80": "Tội phạm",
    "99": "Tài liệu",
    "18": "Chính kịch",
    "10751": "Gia đình",
    "14": "Giả tưởng",
    "36": "Lịch sử",
    "27": "Kinh dị",
    "10402": "Âm nhạc",
    "9648": "Bí ẩn",
    "10749": "Lãng mạn",
    "878": "Khoa học viễn tưởng",
    "10770": "Phim TV",
    "53": "Gây cấn",
    "10752": "Chiến tranh",
    "37": "Miền Tây"
  };

  // Country mapping
  const countryNames: Record<string, string> = {
    "KR": "Hàn Quốc",
    "CN": "Trung Quốc", 
    "US": "Mỹ",
    "JP": "Nhật Bản",
    "TH": "Thái Lan",
    "GB": "Anh"
  };

  // Search movies when params change
  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    // If no search criteria, don't fetch
    if (!query && !selectedGenre && !selectedCountry) {
      setMovies([]);
      return;
    }

    setLoading(true);
    
    let url = "https://api.themoviedb.org/3/";
    let params = new URLSearchParams({
      api_key: apiKey,
      language: "vi-VN",
      page: currentPage.toString()
    });

    // Determine API endpoint based on filters
    const mediaType = selectedType === "tv" ? "tv" : "movie";
    
    if (query) {
      url += `search/${mediaType}`;
      params.set("query", query);
    } else {
      url += `discover/${mediaType}`;
    }

    // Add genre filter
    if (selectedGenre) {
      params.set("with_genres", selectedGenre);
    }

    // Add country filter
    if (selectedCountry) {
      params.set("with_origin_country", selectedCountry);
    }

    fetch(`${url}?${params}`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 0);
      })
      .catch(err => console.error("Error searching movies:", err))
      .finally(() => setLoading(false));

  }, [query, selectedGenre, selectedCountry, selectedType, currentPage]);

  // Fetch genres
  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=vi-VN`)
      .then(res => res.json())
      .then(data => setGenres(data.genres || []))
      .catch(err => console.error("Error fetching genres:", err));
  }, []);

  // Reset page when search criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedGenre, selectedCountry, selectedType]);

  // Get display title
  const getTitle = () => {
    const typeText = selectedType === "tv" ? "Phim Bộ" : "Phim Lẻ";
    
    if (query) return `Kết quả tìm kiếm "${query}"`;
    if (selectedGenre) return `${typeText} ${genreNames[selectedGenre] || "thể loại"}`;
    if (selectedCountry) return `${typeText} ${countryNames[selectedCountry] || "quốc gia"}`;
    if (selectedType && selectedType !== "movie") return typeText;
    return "Kết quả tìm kiếm";
  };

  return (
    <div className={styles.searchPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.icon}>🎬</span>
            {getTitle()}
          </h1>
        </div>

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <div 
            className={styles.filterHeader}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className={styles.filterHeaderLeft}>
              <Filter size={20} />
              <span>Bộ lọc</span>
            </div>
            <div className={styles.filterToggle}>
              {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          
          {showFilters && (
            <div className={styles.filterContent}>
              <div className={styles.filterGrid}>
            {/* Search Input */}
            <div className={styles.filterItem}>
              <label>Tìm kiếm</label>
              <div className={styles.searchInput}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm phim theo tên, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className={styles.filterItem}>
              <label>Thể loại</label>
              <select
                value={selectedGenreFilter}
                onChange={(e) => setSelectedGenreFilter(e.target.value)}
              >
                <option value="">Tất cả thể loại</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div className={styles.filterItem}>
              <label>Quốc gia</label>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
              >
                <option value="">Tất cả quốc gia</option>
                <option value="US">Mỹ</option>
                <option value="KR">Hàn Quốc</option>
                <option value="CN">Trung Quốc</option>
                <option value="JP">Nhật Bản</option>
                <option value="TH">Thái Lan</option>
                <option value="GB">Anh</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className={styles.filterItem}>
              <label>Năm phát hành</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Tất cả năm</option>
                {Array.from({length: 35}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className={styles.filterActions}>
            <button 
              className={styles.applyBtn}
              onClick={() => {
                const params = new URLSearchParams();
                if (searchQuery) params.set("q", searchQuery);
                if (selectedGenreFilter) params.set("genre", selectedGenreFilter);
                if (selectedCountryFilter) params.set("country", selectedCountryFilter);
                if (selectedYear) params.set("year", selectedYear);
                navigate(`/search?${params.toString()}`);
              }}
            >
              <Search size={16} />
              Tìm kiếm
            </button>
            
            <button 
              className={styles.clearBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedGenreFilter("");
                setSelectedCountryFilter("");
                setSelectedYear("");
                navigate("/search");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tìm kiếm...</p>
          </div>
        )}

        {/* Results */}
        {!loading && movies.length > 0 && (
          <>
            <div className={styles.resultInfo}>
              <p>Tìm thấy {movies.length} kết quả (Trang {currentPage}/{totalPages})</p>
            </div>

            <div className={styles.movieGrid}>
              {movies.map(movie => (
                <div 
                  key={movie.id} 
                  className={styles.movieCard}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <div className={styles.posterWrapper}>
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                          : "/no-poster.png"
                      }
                      alt={movie.title}
                      loading="lazy"
                    />
                    <div className={styles.overlay}>
                      <div className={styles.rating}>
                        ⭐ {movie.vote_average.toFixed(1)}
                      </div>
                      <div className={styles.year}>
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.movieTitle}>
                    <h3>{movie.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  ← Trước
                </button>
                
                <div className={styles.pageNumbers}>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && (query || selectedGenre || selectedCountry) && (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h2>Không tìm thấy kết quả</h2>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !query && !selectedGenre && !selectedCountry && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎬</div>
            <h2>Tìm kiếm phim yêu thích</h2>
            <p>Sử dụng thanh tìm kiếm hoặc chọn thể loại để khám phá phim mới</p>
          </div>
        )}
      </div>
    </div>
  );
}
