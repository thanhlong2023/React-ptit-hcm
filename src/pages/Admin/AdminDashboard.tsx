import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

interface DashboardStats {
  totalMovies: number;
  totalSeries: number;
  totalCollections: number;
  duplicates: number;
  trendingMovies: Array<{ id: number; title: string; poster_path: string; vote_average: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMovies: 0,
    totalSeries: 0,
    totalCollections: 0,
    duplicates: 0,
    trendingMovies: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      // Load stats from localStorage
      const moviesData = localStorage.getItem('adminMovies') || '[]';
      const seriesData = localStorage.getItem('adminSeries') || '[]';
      const collectionsData = localStorage.getItem('adminCollections') || '[]';

      const movies = JSON.parse(moviesData);
      const series = JSON.parse(seriesData);
      const collections = JSON.parse(collectionsData);

      // Check for duplicates
      const titles = movies.map((m: Record<string, unknown>) => m.title);
      const duplicates = titles.length - new Set(titles).size;

      // Fetch trending movies from TMDB API
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let trendingMovies: Array<{ id: number; title: string; poster_path: string; vote_average: number }> = [];
      
      if (apiKey) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi-VN`
          );
          const data = await response.json();
          trendingMovies = (data.results || []).slice(0, 5);
        } catch (error) {
          console.error('Error fetching trending movies:', error);
        }
      }

      setStats({
        totalMovies: movies.length,
        totalSeries: series.length,
        totalCollections: collections.length,
        duplicates,
        trendingMovies,
      });
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng Phim Lẻ',
      value: stats.totalMovies,
      icon: '🎬',
      color: '#ff6b6b',
    },
    {
      title: 'Tổng Phim Bộ',
      value: stats.totalSeries,
      icon: '📺',
      color: '#4ecdc4',
    },
    {
      title: 'Bộ Sưu Tập',
      value: stats.totalCollections,
      icon: '📁',
      color: '#45b7d1',
    },
    {
      title: 'Phim Trùng Lặp',
      value: stats.duplicates,
      icon: '⚠️',
      color: '#ffa502',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>🎬 Dashboard Quản Trị</h1>
        <p>Tổng quan về hệ thống quản lý phim MovieZone</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className={styles.content}>
              <h3>{card.title}</h3>
              <p className={styles.value}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Movies */}
      {stats.trendingMovies.length > 0 && (
        <div className={styles.trendingSection}>
          <h2>🔥 Phim Xu Hướng Tuần Này (từ TMDB)</h2>
          <div className={styles.trendingGrid}>
            {stats.trendingMovies.map((movie) => (
              <div key={movie.id} className={styles.trendingCard}>
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className={styles.poster}
                  />
                )}
                <div className={styles.trendingInfo}>
                  <h4>{movie.title}</h4>
                  <div className={styles.rating}>
                    ⭐ {movie.vote_average.toFixed(1)}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>⚡ Hành động nhanh</h2>
        <div className={styles.actionButtons}>
          <button className={styles.btn} style={{ backgroundColor: '#ff6b6b' }}>
            ➕ Thêm phim mới
          </button>
          <button className={styles.btn} style={{ backgroundColor: '#4ecdc4' }}>
            ➕ Thêm phim bộ mới
          </button>
          <button className={styles.btn} style={{ backgroundColor: '#45b7d1' }}>
            ➕ Tạo bộ sưu tập
          </button>
          <button className={styles.btn} style={{ backgroundColor: '#ffa502' }}>
            🧹 Làm sạch dữ liệu
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivity}>
        <h2>📋 Hoạt động gần đây</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.badge}>✅</span>
            <div>
              <p className={styles.activityTitle}>Phim mới được thêm</p>
              <p className={styles.activityTime}>2 giờ trước</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.badge}>🔄</span>
            <div>
              <p className={styles.activityTitle}>Cập nhật thông tin phim</p>
              <p className={styles.activityTime}>5 giờ trước</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.badge}>📁</span>
            <div>
              <p className={styles.activityTitle}>Tạo bộ sưu tập mới</p>
              <p className={styles.activityTime}>1 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
