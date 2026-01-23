import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import { getVotes } from '../apiClient';
import type { Vote } from '../apiClient';

/**
 * VotesListView component.
 *
 * Displays a table of votes for a specific series identified by the URL parameter `seriesId`.
 * Fetches vote data from the API and renders the episode, voter, and target.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function VotesListView() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seriesId) {
      getVotes(seriesId)
        .then((data) => {
          setVotes(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load votes');
          setLoading(false);
        });
    }
  }, [seriesId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Button component={Link} to="/" variant="outlined" style={{ marginBottom: '16px' }}>
        Back to Series
      </Button>
      <Typography variant="h5" gutterBottom>
        Votes (Series {seriesId})
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Episode</TableCell>
              <TableCell>Voter ID</TableCell>
              <TableCell>Target ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {votes.map((vote) => (
              <TableRow key={vote.id}>
                <TableCell>{vote.episode}</TableCell>
                <TableCell>{vote.voterId}</TableCell>
                <TableCell>{vote.votedForId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
