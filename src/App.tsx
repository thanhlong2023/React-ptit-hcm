import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";

import TVSeriesDetailPage from "./pages/TVSeriesDetailPage";
import DiscoverPage from "./pages/DiscoverPage";
import { ThemeProvider } from "./components/Theme";
import ViewAllPage from "./pages/ViewAllPage";
import SearchPage from "./pages/SearchPage";
import PersonDetailPage from "./pages/PersonDetailPage";

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv/:id" element={<TVSeriesDetailPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/view-all" element={<ViewAllPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/person/:personId" element={<PersonDetailPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
