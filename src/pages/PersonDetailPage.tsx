import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import styles from "./PersonDetailPage.module.css";
import MovieCard from "../components/MovieSection/MovieCard";

// Define interfaces for the data structures from TMDB
interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
}

interface MovieCredit {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface PersonCredits {
  cast: MovieCredit[];
  crew: (MovieCredit & { job: string })[];
}

const PersonDetailPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personId) return;

    const fetchPersonData = async () => {
      setLoading(true);
      setError(null);
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const detailsUrlVn = `https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}&language=vi-VN`;
      const creditsUrl = `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${apiKey}&language=vi-VN`;

      try {
        const [detailsRes, creditsRes] = await Promise.all([
          fetch(detailsUrlVn),
          fetch(creditsUrl),
        ]);

        if (!detailsRes.ok || !creditsRes.ok) {
          throw new Error("Failed to fetch data from TMDB.");
        }

        let detailsData = await detailsRes.json();
        const creditsData = await creditsRes.json();

        // Fallback for biography if it's empty
        if (!detailsData.biography) {
          const detailsUrlEn = `https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}`;
          const detailsResEn = await fetch(detailsUrlEn);
          if (detailsResEn.ok) {
            const detailsDataEn = await detailsResEn.json();
            detailsData.biography = detailsDataEn.biography;
          }
        }

        setPerson(detailsData);
        setCredits(creditsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personId]);

  const relatedMovies = useMemo(() => {
    if (!credits) return [];
    const directed = credits.crew.filter((movie) => movie.job === "Director");
    const acted = credits.cast;

    const allMovies = [...directed, ...acted];
    
    // Remove duplicates by ID
    const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());

    return uniqueMovies;
  }, [credits]);

  if (loading) {
    return <div className={styles.personPage}><h1>Đang tải...</h1></div>;
  }

  if (error) {
    return <div className={styles.personPage}><h1>Lỗi: {error}</h1></div>;
  }

  if (!person) {
    return <div className={styles.personPage}><h1>Không tìm thấy thông tin.</h1></div>;
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
    : "/no-avatar.png";

  return (
    <div className={styles.personPage}>
      <header className={styles.personHeader}>
        <img src={profileUrl} alt={person.name} className={styles.profileImage} />
        <div className={styles.personInfo}>
          <h1 className={styles.personName}>{person.name}</h1>
          {person.known_for_department && (
            <p className={styles.department}>
              Chuyên môn: <span>{person.known_for_department}</span>
            </p>
          )}
          {person.birthday && (
            <p className={styles.detailItem}>
              Ngày sinh: <span>{new Date(person.birthday).toLocaleDateString('vi-VN')}</span>
            </p>
          )}
          {person.place_of_birth && (
            <p className={styles.detailItem}>
              Nơi sinh: <span>{person.place_of_birth}</span>
            </p>
          )}
          <p className={styles.biography}>
            {person.biography || "Không có tiểu sử."}
          </p>
        </div>
      </header>

      <main>
        {relatedMovies.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>Phim liên quan</h2>
            <div className={styles.movieGrid}>
              {relatedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PersonDetailPage;
