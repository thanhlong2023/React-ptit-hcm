import Header from "./components/Header/Header";

import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Routes>
    </>
  );
}

export default App;
