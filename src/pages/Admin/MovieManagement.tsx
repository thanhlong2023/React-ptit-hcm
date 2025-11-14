import { useState, useEffect } from 'react';
import styles from './MovieManagement.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: number;
  genres: string[];
  posterUrl: string;
  trailerUrl: string;
  createdAt: string;
}

export default function MovieManagement() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    rating: '5.0',
    genres: '',
    posterUrl: '',
    trailerUrl: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  // View mode: 'local' = admin/local movies, 'tmdb' = browse TMDB
  const [viewMode, setViewMode] = useState<'local' | 'tmdb'>('local');
  const [tmdbMovies, setTmdbMovies] = useState<Array<any>>([]);
  const [tmdbPage, setTmdbPage] = useState<number>(1);
  const [tmdbTotalPages, setTmdbTotalPages] = useState<number>(1);
  const [loadingTmdb, setLoadingTmdb] = useState<boolean>(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = () => {
    const stored = localStorage.getItem('adminMovies');
    if (stored) {
      setMovies(JSON.parse(stored));
    }
  };

  const saveMovies = (data: Movie[]) => {
    localStorage.setItem('adminMovies', JSON.stringify(data));
    setMovies(data);
  };

  // Import a TMDB movie into local adminMovies
  const importTmdbMovie = (tmdb: any) => {
    const newMovie: Movie = {
      id: `tmdb-${tmdb.id}-${Date.now()}`,
      title: tmdb.title || tmdb.name || 'Untitled',
      year: (tmdb.release_date || tmdb.first_air_date || '').slice(0, 4) || new Date().getFullYear().toString(),
      rating: Number(tmdb.vote_average) || 0,
      genres: [],
      posterUrl: tmdb.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : '',
      trailerUrl: '',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    saveMovies([...movies, newMovie]);
    alert(`Đã import: ${newMovie.title}`);
  };

  // Fetch TMDB movies (supports paging and append)
  const fetchTmdb = async (page = 1, append = false) => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;
    try {
      setLoadingTmdb(true);
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=vi-VN&page=${page}`);
      const data = await res.json();
      const results = data.results || [];
      setTmdbMovies((prev) => (append ? [...prev, ...results] : results));
      setTmdbPage(page);
      setTmdbTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch TMDB movies', err);
    } finally {
      setLoadingTmdb(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'tmdb') {
      fetchTmdb(1, false);
    }
  }, [viewMode]);

  const handleAddMovie = () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên phim');
      return;
    }

    if (editingId) {
      const updated = movies.map((m) =>
        m.id === editingId
          ? {
              ...m,
              title: formData.title,
              year: formData.year,
              rating: parseFloat(formData.rating),
              genres: formData.genres.split(',').map((g) => g.trim()),
              posterUrl: formData.posterUrl,
              trailerUrl: formData.trailerUrl,
            }
          : m
      );
      saveMovies(updated);
      setEditingId(null);
    } else {
      const newMovie: Movie = {
        id: Date.now().toString(),
        title: formData.title,
        year: formData.year,
        rating: parseFloat(formData.rating),
        genres: formData.genres.split(',').map((g) => g.trim()),
        posterUrl: formData.posterUrl,
        trailerUrl: formData.trailerUrl,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      saveMovies([...movies, newMovie]);
    }

    setFormData({
      title: '',
      year: new Date().getFullYear().toString(),
      rating: '5.0',
      genres: '',
      posterUrl: '',
      trailerUrl: '',
    });
    setShowForm(false);
  };

  const handleEdit = (movie: Movie) => {
    setFormData({
      title: movie.title,
      year: movie.year,
      rating: movie.rating.toString(),
      genres: movie.genres.join(', '),
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa phim này?')) {
      saveMovies(movies.filter((m) => m.id !== id));
    }
  };

  const handlePosterUpload = async (file: File) => {
    if (!file) return;

    const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkzrqnahy';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'React_Project';

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', uploadPreset);

    try {
      setUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setFormData({ ...formData, posterUrl: data.secure_url });
        alert('✅ Upload poster thành công!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('❌ Upload poster thất bại');
    } finally {
      setUploading(false);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1>Quản lý Phim Lẻ</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={styles.tabBtn}
              onClick={() => setViewMode('local')}
              style={{ backgroundColor: viewMode === 'local' ? '#ff6b6b' : 'transparent' }}
            >
              Local
            </button>
            <button
              className={styles.tabBtn}
              onClick={() => setViewMode('tmdb')}
              style={{ backgroundColor: viewMode === 'tmdb' ? '#4ecdc4' : 'transparent' }}
            >
              TMDB
            </button>
          </div>
        </div>
        {viewMode === 'local' ? (
          <button
            className={styles.addBtn}
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: '',
                year: new Date().getFullYear().toString(),
                rating: '5.0',
                genres: '',
                posterUrl: '',
                trailerUrl: '',
              });
              setShowForm(!showForm);
            }}
          >
            {showForm ? '❌ Hủy' : '➕ Thêm phim'}
          </button>
        ) : (
          <div />
        )}
      </div>

      {showForm && (
        <form className={styles.form}>
          <input
            type="text"
            placeholder="Tên phim"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Năm phát hành"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
          <input
            type="number"
            placeholder="Rating (0-10)"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
          <input
            type="text"
            placeholder="Thể loại (phân tách bằng dấu phẩy)"
            value={formData.genres}
            onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
          />
          
          <div className={styles.uploadSection}>
            <label>📸 Upload Poster:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePosterUpload(file);
              }}
              className={styles.fileInput}
              disabled={uploading}
            />
            {formData.posterUrl && (
              <div className={styles.posterPreview}>
                <img src={formData.posterUrl} alt="Poster preview" />
              </div>
            )}
          </div>

          <input
            type="url"
            placeholder="URL Trailer (YouTube, etc.)"
            value={formData.trailerUrl}
            onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
          />

          <button type="button" onClick={handleAddMovie} className={styles.submitBtn} disabled={uploading}>
            {editingId ? '💾 Cập nhật' : '➕ Thêm'}
          </button>
        </form>
      )}

      {viewMode === 'tmdb' ? (
        <div>
          <h3 className={styles.tmdbHeading}>Kết quả TMDB</h3>
          <div className={styles.tmdbControls}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className={styles.actionBtn} disabled={tmdbPage <= 1 || loadingTmdb} onClick={() => fetchTmdb(Math.max(1, tmdbPage - 1), false)}>◀ Prev</button>
              <button className={styles.actionBtn} disabled={tmdbPage >= tmdbTotalPages || loadingTmdb} onClick={() => fetchTmdb(Math.min(tmdbTotalPages, tmdbPage + 1), false)}>Next ▶</button>
              <span className={styles.count} style={{ marginLeft: 8 }}>Page {tmdbPage} / {tmdbTotalPages}</span>
            </div>
            <div>
              <button className={styles.actionBtn} disabled={tmdbPage >= tmdbTotalPages || loadingTmdb} onClick={() => fetchTmdb(tmdbPage + 1, true)}>Load more</button>
            </div>
          </div>

          <div className={styles.tmdbGrid}>
            {tmdbMovies.map((m: any) => (
              <div key={m.id} className={styles.tmdbCard}>
                {m.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title || m.name} className={styles.tmdbPoster} />
                ) : (
                  <div className={styles.tmdbPoster} style={{ height: 260, background: '#222' }} />
                )}
                <div className={styles.tmdbInfo}>
                  <div>
                    <div className={styles.tmdbTitle}>{m.title || m.name}</div>
                    <div className={styles.tmdbMeta}>{(m.release_date || m.first_air_date || '').slice(0,4)}</div>
                  </div>
                  <div className={styles.tmdbActions}>
                    <button className={styles.tmdbBtn} onClick={() => importTmdbMovie(m)}>➕ Import</button>
                    <a target="_blank" rel="noreferrer" href={`https://www.themoviedb.org/movie/${m.id}`} className={`${styles.tmdbBtn} ${styles.tmdbBtnSecondary}`}>🔎 TMDB</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loadingTmdb && <p style={{ color: '#9ca3af', marginTop: 12 }}>Đang tải...</p>}
        </div>
      ) : (
        <>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={styles.count}>Tổng: {filteredMovies.length}</span>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên phim</th>
                  <th>Năm</th>
                  <th>Rating</th>
                  <th>Thể loại</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td className={styles.titleCell}>{movie.title}</td>
                    <td>{movie.year}</td>
                    <td>
                      <span className={styles.rating}>⭐ {movie.rating}</span>
                    </td>
                    <td>{movie.genres.join(', ')}</td>
                    <td className={styles.date}>{movie.createdAt}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(movie)}
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(movie.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
