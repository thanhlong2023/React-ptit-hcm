import { useState } from 'react'
import FilterBox from '../components/FilterBox/FilterBox'
import HeroBanner from '../components/HeroBanner/HeroBanner'
import MovieSection from '../components/MovieSection/MovieSection'
import FilteredTVSeriesGrid from '../components/FilteredMoviesGrid/FilteredTVSeriesGrid'

interface FilterState {
  sortBy: string;
  type: string;
  genre: string;
  country: string;
  language: string;
  year: string;
}

function TVSeriesPage() {
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "Mới Lên Sóng",
    type: "Tất cả",
    genre: "Phim Bộ",
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
            <FilteredTVSeriesGrid {...filterState} />
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
              Xem tất cả phim bộ
            </button>
          </>
        ) : (
          <>
            <MovieSection
                    title="Phim bộ phổ biến"
                    apiUrl={`https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim bộ Hành động"
                    apiUrl={`https://api.themoviedb.org/3/discover/tv?with_genres=10759&sort_by=popularity.desc&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim bộ Tâm lý"
                    apiUrl={`https://api.themoviedb.org/3/discover/tv?with_genres=18&sort_by=popularity.desc&language=vi-VN`}
                  />
            <MovieSection
                    title="Phim bộ Hài hước"
                    apiUrl={`https://api.themoviedb.org/3/discover/tv?with_genres=35&sort_by=popularity.desc&language=vi-VN`}
                  />
          </>
        )}
    </div>
  )
}

export default TVSeriesPage
