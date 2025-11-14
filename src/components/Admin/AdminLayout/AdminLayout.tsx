import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import { getAuthToken, removeAuthToken } from "../../../services/authService";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/movies", label: "Quản lý Phim", icon: "🎬" },
    { path: "/admin/collections", label: "Quản lý Bộ sưu tập", icon: "📁" },
    { path: "/admin/cleanup", label: "Làm sạch Dữ liệu", icon: "🧹" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>🎥 MovieZone Admin</h1>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                isActive(item.path) ? styles.active : ""
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.userInfo} onClick={logout}>
          <p>👤 Admin</p>
          <button className={styles.logoutBtn}>Đăng xuất</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
