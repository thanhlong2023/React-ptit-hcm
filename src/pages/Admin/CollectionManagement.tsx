import { useState, useEffect } from 'react';
import styles from './CollectionManagement.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Movie {
  id: string;
  title: string;
  year: string;
  rating: number;
  genres: string[];
  posterUrl: string;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  movieIds: string[];
  createdAt: string;
}

export default function CollectionManagement() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tmdbMovies, setTmdbMovies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    movieIds: [] as string[],
  });
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectSource, setSelectSource] = useState<'local' | 'tmdb'>('local');

  useEffect(() => {
    loadCollections();
    loadMovies();
    // Pre-fetch TMDB popular movies for selection
    const fetchTmdb = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      if (!apiKey) return;
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=vi-VN&page=1`);
        const data = await res.json();
        setTmdbMovies(data.results || []);
      } catch (err) {
        console.error('Failed to fetch TMDB movies for collections', err);
      }
    };
    fetchTmdb();
  }, []);

  const loadCollections = () => {
    const stored = localStorage.getItem('adminCollections');
    if (stored) {
      setCollections(JSON.parse(stored));
    }
  };

  const loadMovies = () => {
    const stored = localStorage.getItem('adminMovies');
    if (stored) {
      setMovies(JSON.parse(stored) as Movie[]);
    }
  };

  const saveCollections = (data: Collection[]) => {
    localStorage.setItem('adminCollections', JSON.stringify(data));
    setCollections(data);
  };

  const handleAddCollection = () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bộ sưu tập');
      return;
    }

    if (editingId) {
      const updated = collections.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name,
              description: formData.description,
              movieIds: selectedMovies,
            }
          : c
      );
      saveCollections(updated);
      setEditingId(null);
    } else {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        movieIds: selectedMovies,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      saveCollections([...collections, newCollection]);
    }

    setFormData({ name: '', description: '', movieIds: [] });
    setSelectedMovies([]);
    setShowForm(false);
  };

  const handleEdit = (collection: Collection) => {
    setFormData({
      name: collection.name,
      description: collection.description,
      movieIds: collection.movieIds,
    });
    setSelectedMovies(collection.movieIds);
    setEditingId(collection.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa bộ sưu tập này?')) {
      saveCollections(collections.filter((c) => c.id !== id));
    }
  };

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovies((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  const toggleTmdbSelection = (tmdbId: number) => {
    const key = `tmdb:${tmdbId}`;
    toggleMovieSelection(key);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Bộ Sưu Tập</h1>
        <button
          className={styles.addBtn}
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', movieIds: [] });
            setSelectedMovies([]);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '❌ Hủy' : '➕ Tạo bộ sưu tập'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <div className={styles.formSection}>
            <h3>Thông tin bộ sưu tập</h3>
            <input
              type="text"
              placeholder="Tên bộ sưu tập"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
              placeholder="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={styles.formSection}>
            <h3>Chọn phim ({selectedMovies.length})</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button className={styles.tabBtn} onClick={() => setSelectSource('local')} style={{ background: selectSource === 'local' ? '#ff6b6b' : 'transparent' }}>Local</button>
              <button className={styles.tabBtn} onClick={() => setSelectSource('tmdb')} style={{ background: selectSource === 'tmdb' ? '#4ecdc4' : 'transparent' }}>TMDB</button>
            </div>
            <div className={styles.movieGrid}>
              {selectSource === 'local' && movies.map((movie) => (
                <label key={movie.id} className={styles.movieCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(movie.id)}
                    onChange={() => toggleMovieSelection(movie.id)}
                  />
                  <span>{movie.title}</span>
                </label>
              ))}
              {selectSource === 'tmdb' && tmdbMovies.map((m) => (
                <label key={m.id} className={styles.movieCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(`tmdb:${m.id}`)}
                    onChange={() => toggleTmdbSelection(m.id)}
                  />
                  <span>{m.title || m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleAddCollection} className={styles.submitBtn}>
            {editingId ? '💾 Cập nhật' : '➕ Tạo'}
          </button>
        </div>
      )}

      <div className={styles.collectionsGrid}>
        {collections.map((collection) => {
          // Resolve movie items: local movies by id, TMDB items by prefix 'tmdb:'
          const collectionMovies = collection.movieIds.map((id) => {
            if (id.startsWith('tmdb:')) {
              const tmdbId = Number(id.split(':')[1]);
              return tmdbMovies.find((t) => t.id === tmdbId) || { title: `TMDB #${tmdbId}` };
            }
            return movies.find((m) => m.id === id) || { title: id };
          });
          return (
            <div key={collection.id} className={styles.collectionCard}>
              <div className={styles.cardHeader}>
                <h3>{collection.name}</h3>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEdit(collection)}
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(collection.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className={styles.description}>{collection.description}</p>
              <div className={styles.stats}>
                <span>📽️ {collectionMovies.length} phim</span>
                <span>📅 {collection.createdAt}</span>
              </div>
              <div className={styles.moviePreview}>
                {collectionMovies.slice(0, 3).map((movie) => (
                  <span key={movie.id} className={styles.movieTag}>
                    {movie.title}
                  </span>
                ))}
                {collectionMovies.length > 3 && (
                  <span className={styles.moreTag}>+{collectionMovies.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {collections.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <p>📁 Chưa có bộ sưu tập nào</p>
        </div>
      )}
    </div>
  );
}
