import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";
<<<<<<< HEAD
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
=======
import TVSeriesPage from "./pages/TVSeriesPage";
import MoviesPage from "./pages/moviesPage";
>>>>>>> d2c976494275ab2481d5ede330552eb78ec305f2

function App() {
  return (  
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
<<<<<<< HEAD
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
=======
        <Route path="/tv-series" element={<TVSeriesPage />} />
        <Route path="/movies" element={<MoviesPage />} />
>>>>>>> d2c976494275ab2481d5ede330552eb78ec305f2
      </Routes>
    </>
  );
}

export default App;
