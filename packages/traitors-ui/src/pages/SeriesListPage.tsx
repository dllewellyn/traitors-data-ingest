import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DefaultService, type Series } from "../api-client";

export const SeriesListPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await DefaultService.listSeries();
        setSeries(data);
      } catch (err) {
        setError("Failed to fetch series data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
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
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Available Series</h1>
      <div className="row">
        {series.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text text-muted">
                  Series {item.id} ({item.year})
                </p>
                <Link
                  to={`/series/${item.id}`}
                  className="btn btn-primary stretched-link"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
