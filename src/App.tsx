import Header from "./components/Header/Header";

import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";
import TVSeriesPage from "./pages/TVSeriesPage";
import MoviesPage from "./pages/moviesPage";
import { ThemeProvider } from "./components/Theme";

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv-series" element={<TVSeriesPage />} />
        <Route path="/movies" element={<MoviesPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
