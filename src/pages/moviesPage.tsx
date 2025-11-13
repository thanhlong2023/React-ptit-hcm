import { useState } from 'react'
import FilterBox from '../components/FilterBox/FilterBox'
import HeroBanner from '../components/HeroBanner/HeroBanner'
import MovieSection from '../components/MovieSection/MovieSection'
import FilteredMoviesGrid from '../components/FilteredMoviesGrid/FilteredMoviesGrid'

interface FilterState {
  sortBy: string;
  type: string;
  genre: string;
  country: string;
  language: string;
  year: string;
}

function MoviesPage() {
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "Mới Lên Sóng",
    type: "Tất cả",
    genre: "Phim Lẻ",
    country: "Tất cả",
    language: "Tất cả",
    year: "Tất cả",
  });

  const handleFilter = (filters: FilterState) => {
    setFilterState(filters);
    setIsFiltered(true);
  };

  return (
    <div className='bg-[#1b1f2f]'>
        <HeroBanner></HeroBanner>
        <FilterBox onFilter={handleFilter}></FilterBox>

        {isFiltered ? (
          <>
            <FilteredMoviesGrid {...filterState} />
            <button
              onClick={() => setIsFiltered(false)}
              style={{
                display: 'block',
                margin: '40px auto',
                padding: '10px 30px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Xem tất cả phim
            </button>
          </>
        ) : (
          <>
            <MovieSection
                    title="Phim hoạt hình hay nhất"
                    apiUrl={`https://api.themoviedb.org/3/discover/movie?with_genres=16&sort_by=vote_average.desc&vote_count.gte=1000&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim lẻ Hành động"
                    apiUrl={`https://api.themoviedb.org/3/discover/movie?with_genres=28&sort_by=popularity.desc&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim lẻ Tâm lý"
                    apiUrl={`https://api.themoviedb.org/3/discover/movie?with_genres=18&sort_by=popularity.desc&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim lẻ Hài hước"
                    apiUrl={`https://api.themoviedb.org/3/discover/movie?with_genres=35&sort_by=popularity.desc&language=vi-VN`}
                  />
          </>
        )}
    </div>
  )
}

export default MoviesPage
