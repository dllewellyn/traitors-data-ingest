import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SeriesListView from '../SeriesListView';
import * as apiClient from '../../apiClient';
import '@testing-library/jest-dom';

jest.mock('../../apiClient', () => ({
  getSeries: jest.fn(),
}));

describe('SeriesListView', () => {
  it('renders loading state initially', () => {
    (apiClient.getSeries as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <SeriesListView />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders series list when data is fetched', async () => {
    const mockSeries = [
      { id: 1, title: 'Series 1', year: 2022 },
      { id: 2, title: 'Series 2', year: 2023 },
    ];
    (apiClient.getSeries as jest.Mock).mockResolvedValue(mockSeries);

    render(
      <BrowserRouter>
        <SeriesListView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Series 1')).toBeInTheDocument();
      expect(screen.getByText('Series 2')).toBeInTheDocument();
      expect(screen.getByText('Year: 2022')).toBeInTheDocument();
      expect(screen.getAllByText('View Votes')).toHaveLength(2);
    });
  });

  it('renders error message on fetch failure', async () => {
    (apiClient.getSeries as jest.Mock).mockRejectedValue(new Error('Failed'));

    render(
      <BrowserRouter>
        <SeriesListView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load series')).toBeInTheDocument();
    });
  });
});
