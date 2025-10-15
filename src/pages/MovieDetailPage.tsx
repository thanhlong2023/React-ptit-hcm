import { useParams } from "react-router-dom";
import MovieDetail from "../components/MovieDetail/MovieDetail";

export default function MovieDetailPage() {
  const { id } = useParams();
  const movieId = Number(id);
  if (Number.isNaN(movieId)) return <div>Id phim không hợp lệ.</div>;
  return <MovieDetail movieId={movieId} />;
}
