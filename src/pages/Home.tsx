import HeroBanner from "../components/HeroBanner/HeroBanner";
import MovieSection from "../components/MovieSection/MovieSection";
import "./Home.css";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <MovieSection
        title="Phim Hàn Quốc mới"
        apiUrl="https://api.themoviedb.org/3/discover/movie?with_origin_country=KR&sort_by=popularity.desc"
      />

      <MovieSection
        title="Phim Trung Quốc mới"
        apiUrl="https://api.themoviedb.org/3/discover/movie?with_origin_country=CN&sort_by=popularity.desc"
      />

      <MovieSection
        title="Phim US-UK mới"
        apiUrl="https://api.themoviedb.org/3/discover/movie?with_origin_country=US&sort_by=popularity.desc"
      />
    </>
  );
}
