import { Routes, Route } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import SeriesListView from './views/SeriesListView';
import CandidateListView from './views/CandidateListView';

function App() {
  return (
    <Container>
      <Typography variant="h1" component="h1" gutterBottom>
        The Traitors
      </Typography>
      <Routes>
        <Route path="/" element={<SeriesListView />} />
        <Route path="/series/:seriesId" element={<CandidateListView />} />
      </Routes>
    </Container>
  );
}

export default App;
