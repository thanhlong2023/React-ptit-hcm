import { useState, useEffect } from 'react';
import styles from './MovieManagement.module.css';

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: number;
  genres: string[];
  posterUrl: string;
  createdAt: string;
}

export default function MovieManagement() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    rating: '5.0',
    genres: '',
    posterUrl: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

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
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa phim này?')) {
      saveMovies(movies.filter((m) => m.id !== id));
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Phim Lẻ</h1>
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
            });
            setShowForm(!showForm);
          }}
        >
          {showForm ? '❌ Hủy' : '➕ Thêm phim'}
        </button>
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
          <input
            type="url"
            placeholder="URL poster"
            value={formData.posterUrl}
            onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
          />
          <button type="button" onClick={handleAddMovie} className={styles.submitBtn}>
            {editingId ? '💾 Cập nhật' : '➕ Thêm'}
          </button>
        </form>
      )}

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
    </div>
  );
}
