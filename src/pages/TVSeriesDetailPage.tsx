import { useParams } from "react-router-dom";

// This is a placeholder component.
// It should be expanded to fetch and display TV series details.
function TVSeriesDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ color: 'white', padding: '100px 20px' }}>
      <h1>TV Series Detail Page</h1>
      <p>Details for TV Series with ID: {id}</p>
      <p>Note: This page is a placeholder and needs to be implemented.</p>
    </div>
  );
}

export default TVSeriesDetailPage;
