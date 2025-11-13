import { useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";
import TVSeriesPage from "./pages/TVSeriesPage";
import MoviesPage from "./pages/moviesPage";
import AdminPage from "./pages/Admin/AdminPage";

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPath && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv-series" element={<TVSeriesPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;
