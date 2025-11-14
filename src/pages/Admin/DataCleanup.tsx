import { useState, useEffect } from 'react';
import styles from './DataCleanup.module.css';

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: number;
  genres: string[];
  posterUrl: string;
  createdAt: string;
}

interface DuplicateGroup {
  title: string;
  movies: Movie[];
}

export default function DataCleanup() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [invalidData, setInvalidData] = useState<Movie[]>([]);
  const [cleanupLog, setCleanupLog] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('adminMovies');
    if (stored) {
      const parsed = JSON.parse(stored) as Movie[];
      setMovies(parsed);
      findDuplicates(parsed);
      checkInvalidData(parsed);
    }
  }, []);

  const findDuplicates = (moviesData: Movie[]) => {
    const titleMap = new Map<string, Movie[]>();

    moviesData.forEach((movie) => {
      const normalizedTitle = movie.title.toLowerCase().trim();
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, []);
      }
      titleMap.get(normalizedTitle)?.push(movie);
    });

    const duplicatesList = Array.from(titleMap.values())
      .filter((group) => group.length > 1)
      .map((group) => ({
        title: group[0].title,
        movies: group,
      }));

    setDuplicates(duplicatesList);
  };

  const checkInvalidData = (moviesData: Movie[]) => {
    const invalid = moviesData.filter((movie) => {
      const hasValidYear = /^\d{4}$/.test(movie.year);
      const hasValidRating = movie.rating >= 0 && movie.rating <= 10;
      const hasTitle = movie.title.trim().length > 0;

      return !hasValidYear || !hasValidRating || !hasTitle;
    });

    setInvalidData(invalid);
  };

  const handleDeleteDuplicate = (titleToDelete: string, movieIdToDelete: string) => {
    const updated = movies.filter((m) => !(m.title === titleToDelete && m.id === movieIdToDelete));
    localStorage.setItem('adminMovies', JSON.stringify(updated));
    setMovies(updated);
    findDuplicates(updated);

    const newLog = [
      ...cleanupLog,
      `✅ Xóa phim trùng: ${titleToDelete} (ID: ${movieIdToDelete})`,
    ];
    setCleanupLog(newLog);
  };

  const handleDeleteInvalid = (movieId: string) => {
    const updated = movies.filter((m) => m.id !== movieId);
    localStorage.setItem('adminMovies', JSON.stringify(updated));
    setMovies(updated);
    checkInvalidData(updated);

    const movie = movies.find((m) => m.id === movieId);
    const newLog = [
      ...cleanupLog,
      `✅ Xóa dữ liệu lỗi: ${movie?.title || 'Unknown'} (ID: ${movieId})`,
    ];
    setCleanupLog(newLog);
  };

  const runFullCleanup = () => {
    if (window.confirm('Thực hiện làm sạch toàn bộ dữ liệu? Hành động này không thể hoàn tác!')) {
      // Keep only the first movie from each duplicate group
      const uniqueTitles = new Set<string>();
      const cleaned = movies.filter((movie) => {
        const title = movie.title.toLowerCase().trim();
        if (uniqueTitles.has(title)) {
          return false;
        }
        uniqueTitles.add(title);
        return true;
      });

      // Also remove invalid data
      const finalCleanup = cleaned.filter((movie) => {
        const hasValidYear = /^\d{4}$/.test(movie.year);
        const hasValidRating = movie.rating >= 0 && movie.rating <= 10;
        const hasTitle = movie.title.trim().length > 0;
        return hasValidYear && hasValidRating && hasTitle;
      });

      localStorage.setItem('adminMovies', JSON.stringify(finalCleanup));
      setMovies(finalCleanup);

      const removed = movies.length - finalCleanup.length;
      const newLog = [
        ...cleanupLog,
        `✅ Làm sạch hoàn toàn: Xóa ${removed} phim trùng lặp/lỗi`,
        `📊 Còn lại: ${finalCleanup.length} phim`,
      ];
      setCleanupLog(newLog);

      findDuplicates(finalCleanup);
      checkInvalidData(finalCleanup);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧹 Làm sạch Dữ liệu</h1>
        <button className={styles.cleanupBtn} onClick={runFullCleanup}>
          ⚡ Làm sạch toàn bộ
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <p>Tổng phim</p>
          <h3>{movies.length}</h3>
        </div>
        <div className={styles.statBox}>
          <p>Phim trùng</p>
          <h3>{duplicates.reduce((sum, d) => sum + d.movies.length - 1, 0)}</h3>
        </div>
        <div className={styles.statBox}>
          <p>Dữ liệu lỗi</p>
          <h3>{invalidData.length}</h3>
        </div>
      </div>

      {/* Duplicates Section */}
      {duplicates.length > 0 && (
        <div className={styles.section}>
          <h2>🔄 Phim Trùng Lặp</h2>
          {duplicates.map((group, index) => (
            <div key={index} className={styles.duplicateGroup}>
              <h3>{group.title}</h3>
              <p className={styles.count}>Tìm thấy {group.movies.length} bản</p>
              <div className={styles.movieList}>
                {group.movies.map((movie, idx) => (
                  <div key={movie.id} className={styles.movieItem}>
                    <div className={styles.movieInfo}>
                      <span className={styles.badge}>#{idx + 1}</span>
                      <span>{movie.title}</span>
                      <span className={styles.year}>({movie.year})</span>
                    </div>
                    {idx > 0 && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteDuplicate(movie.title, movie.id)}
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invalid Data Section */}
      {invalidData.length > 0 && (
        <div className={styles.section}>
          <h2>❌ Dữ liệu Lỗi</h2>
          <div className={styles.invalidList}>
            {invalidData.map((movie) => {
              const issues = [];
              if (!/^\d{4}$/.test(movie.year)) issues.push('Năm lỗi');
              if (movie.rating < 0 || movie.rating > 10) issues.push('Rating lỗi');
              if (movie.title.trim().length === 0) issues.push('Tên phim trống');

              return (
                <div key={movie.id} className={styles.invalidItem}>
                  <div className={styles.invalidInfo}>
                    <span className={styles.title}>{movie.title}</span>
                    <div className={styles.issues}>
                      {issues.map((issue) => (
                        <span key={issue} className={styles.issueTag}>
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteInvalid(movie.id)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {duplicates.length === 0 && invalidData.length === 0 && (
        <div className={styles.successMessage}>
          <p>✅ Dữ liệu sạch sẽ! Không tìm thấy phim trùng lặp hoặc dữ liệu lỗi.</p>
        </div>
      )}

      {/* Cleanup Log */}
      {cleanupLog.length > 0 && (
        <div className={styles.section}>
          <h2>📋 Nhật ký Làm sạch</h2>
          <div className={styles.logContainer}>
            {cleanupLog.map((log, index) => (
              <p key={index} className={styles.logItem}>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
