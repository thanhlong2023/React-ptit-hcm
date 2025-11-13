import HeroBanner from "../components/HeroBanner/HeroBanner";
import MovieSection from "../components/MovieSection/MovieSection";
import "./Home.css";

export default function Home() {
  return (
    <>
      <HeroBanner />

      <MovieSection
        title="Phim Hàn Quốc mới"
        apiUrl={`https://api.themoviedb.org/3/discover/movie?with_origin_country=KR&sort_by=popularity.desc&language=vi-VN`}
      />

      <MovieSection
        title="Phim Trung Quốc mới"
        apiUrl={`https://api.themoviedb.org/3/discover/movie?with_origin_country=CN&sort_by=popularity.desc&language=vi-VN`}
      />

      <MovieSection
        title="Phim US-UK mới"
        apiUrl={`https://api.themoviedb.org/3/discover/movie?with_origin_country=US&sort_by=popularity.desc&language=vi-VN`}
      />

      {/* Phim hoạt hình mới nhất */}
      <MovieSection
        title="Phim hoạt hình hay nhất"
        apiUrl={`https://api.themoviedb.org/3/discover/movie?with_genres=16&sort_by=vote_average.desc&vote_count.gte=1000&language=vi-VN
`}
      />

      {/* Phim hay nhất mọi thời đại */}
      <MovieSection
        title="Phim hay nhất mọi thời đại"
        apiUrl={`https://api.themoviedb.org/3/movie/top_rated?language=vi-VN`}
      />
    </>
  );
}
