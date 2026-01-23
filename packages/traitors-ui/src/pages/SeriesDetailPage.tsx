import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DefaultService, type Series, type Candidate } from "../api-client";

export const SeriesDetailPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and sorting state
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) return;

      setLoading(true);
      setError(null);

      try {
        const id = parseInt(seriesId, 10);

        // Fetch series details
        const seriesData = await DefaultService.getSeriesById(id);
        setSeries(seriesData);

        // Fetch candidates with pagination and sorting
        const candidatesData = await DefaultService.getCandidatesBySeries(
          id,
          limit,
          offset,
          sortBy as "name", // Cast as API expects specific enum
          sortOrder
        );
        setCandidates(candidatesData);
      } catch (err) {
        setError("Failed to fetch series details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId, limit, offset, sortBy, sortOrder]);

  const handleSort = (field: "name" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setOffset(0); // Reset to first page on sort change
  };

  const handleNextPage = () => {
    setOffset((prev) => prev + limit);
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  if (loading && !series) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/" className="btn btn-secondary mt-3">
          Back to Series List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Series {series?.id}
          </li>
        </ol>
      </nav>

      <h1 className="mb-4">{series?.title}</h1>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Candidates</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        candidate.role === "Traitor"
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      {candidate.role}
                    </span>
                  </td>
                  <td>{candidate.outcome}</td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handlePrevPage}
            disabled={offset === 0}
          >
            Previous
          </button>
          <span className="text-muted small">
            Showing {offset + 1}-{offset + candidates.length}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNextPage}
            disabled={candidates.length < limit}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
