import Header from "./components/Header/Header";

import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./pages/MovieDetailPage";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Routes>
    </>
  );
}

export default App;
