import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VotesListView from '../VotesListView';
import * as apiClient from '../../apiClient';
import '@testing-library/jest-dom';

jest.mock('../../apiClient', () => ({
  getVotes: jest.fn(),
}));

describe('VotesListView', () => {
  it('renders loading state initially', () => {
    (apiClient.getVotes as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/series/1/votes']}>
        <Routes>
          <Route path="/series/:seriesId/votes" element={<VotesListView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders votes list when data is fetched', async () => {
    const mockVotes = [
      { id: 1, episode: 1, voterId: 101, votedForId: 102, seriesId: 1 },
      { id: 2, episode: 1, voterId: 103, votedForId: 102, seriesId: 1 },
    ];
    (apiClient.getVotes as jest.Mock).mockResolvedValue(mockVotes);

    render(
      <MemoryRouter initialEntries={['/series/1/votes']}>
        <Routes>
          <Route path="/series/:seriesId/votes" element={<VotesListView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Votes (Series 1)')).toBeInTheDocument();
      // Check for Episode column value
      // Episode 1 appears in the mock data once. "1" might appear elsewhere (e.g. series ID in title), so check strictly or loosely depending on render.
      // 2 episodes in list, but one is episode 1, one is episode 2.
      // "1" appears in "Series 1" and in the episode column.
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
      // Check for Voter IDs
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('103')).toBeInTheDocument();
      // Check for Target ID
      expect(screen.getAllByText('102')).toHaveLength(2);
    });
  });

  it('renders error message on fetch failure', async () => {
    (apiClient.getVotes as jest.Mock).mockRejectedValue(new Error('Failed'));

    render(
      <MemoryRouter initialEntries={['/series/1/votes']}>
        <Routes>
          <Route path="/series/:seriesId/votes" element={<VotesListView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load votes')).toBeInTheDocument();
    });
  });
});
