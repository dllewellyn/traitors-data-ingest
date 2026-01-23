import type { Api } from '@gcp-adl/core';

export type Series = Api.components['schemas']['Series'];
export type Candidate = Api.components['schemas']['Candidate'];

/**
 * Fetches the list of all available series from the API.
 *
 * @returns {Promise<Series[]>} A promise that resolves to an array of Series objects.
 * @throws {Error} If the API request fails.
 */
export const getSeries = async (): Promise<Series[]> => {
  const response = await fetch('/api/series');
  if (!response.ok) {
    throw new Error('Failed to fetch series');
  }
  return response.json();
};

/**
 * Fetches the list of candidates for a specific series.
 *
 * @param {string} seriesId - The ID of the series to fetch candidates for.
 * @returns {Promise<Candidate[]>} A promise that resolves to an array of Candidate objects.
 * @throws {Error} If the API request fails.
 */
export const getCandidates = async (seriesId: string): Promise<Candidate[]> => {
  const response = await fetch(`/api/series/${seriesId}/candidates`);
  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }
  return response.json();
};
