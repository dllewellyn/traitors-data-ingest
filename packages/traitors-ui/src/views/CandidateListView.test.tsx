import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CandidateListView from '../CandidateListView';
import * as apiClient from '../../apiClient';
import '@testing-library/jest-dom';

jest.mock('../../apiClient', () => ({
  getCandidates: jest.fn(),
}));

describe('CandidateListView', () => {
  it('renders loading state initially', () => {
    (apiClient.getCandidates as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/series/1']}>
        <Routes>
          <Route path="/series/:seriesId" element={<CandidateListView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders candidates list when data is fetched', async () => {
    const mockCandidates = [
      { id: 101, name: 'Alice', role: 'Faithful', outcome: 'Winner', seriesId: 1 },
      { id: 102, name: 'Bob', role: 'Traitor', outcome: 'Banished', seriesId: 1 },
    ];
    (apiClient.getCandidates as jest.Mock).mockResolvedValue(mockCandidates);

    render(
      <MemoryRouter initialEntries={['/series/1']}>
        <Routes>
          <Route path="/series/:seriesId" element={<CandidateListView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Candidates (Series 1)')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Winner')).toBeInTheDocument();
      expect(screen.getByText('Banished')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    (apiClient.getCandidates as jest.Mock).mockRejectedValue(new Error('Failed'));

    render(
      <MemoryRouter initialEntries={['/series/1']}>
        <Routes>
          <Route path="/series/:seriesId" element={<CandidateListView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load candidates')).toBeInTheDocument();
    });
  });
});
