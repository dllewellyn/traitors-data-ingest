import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeriesListPage } from "./pages/SeriesListPage";
import { SeriesDetailPage } from "./pages/SeriesDetailPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-dark mb-4">
          <div className="container">
            <span className="navbar-brand mb-0 h1">The Traitors Data</span>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<SeriesListPage />} />
          <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
