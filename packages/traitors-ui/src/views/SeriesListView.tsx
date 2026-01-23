import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { getSeries } from '../apiClient';
import type { Series } from '../apiClient';

/**
 * SeriesListView component.
 *
 * Displays a list of all available series. Each series is a link that navigates
 * to the detailed candidate view for that series.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function SeriesListView() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeries()
      .then((data) => {
        setSeriesList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load series');
        setLoading(false);
      });
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h5" gutterBottom>
        Select a Series
      </Typography>
      <List>
        {seriesList.map((series) => (
          <ListItem key={series.id} component={Link} to={`/series/${series.id}`}>
            <ListItemText
              primary={series.title}
              secondary={`Year: ${series.year}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
