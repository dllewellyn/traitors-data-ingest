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
import { getCandidates } from '../apiClient';
import type { Candidate } from '../apiClient';

/**
 * CandidateListView component.
 *
 * Displays a table of candidates for a specific series identified by the URL parameter `seriesId`.
 * Fetches candidate data from the API and renders their name, role, and outcome.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function CandidateListView() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seriesId) {
      getCandidates(seriesId)
        .then((data) => {
          setCandidates(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load candidates');
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
        Candidates (Series {seriesId})
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.role}</TableCell>
                <TableCell>{candidate.outcome}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
