import type { Api } from '@gcp-adl/core';

export type Series = Api.components['schemas']['Series'];
export type Candidate = Api.components['schemas']['Candidate'];

export const getSeries = async (): Promise<Series[]> => {
  const response = await fetch('/api/series');
  if (!response.ok) {
    throw new Error('Failed to fetch series');
  }
  return response.json();
};

export const getCandidates = async (seriesId: string): Promise<Candidate[]> => {
  const response = await fetch(`/api/series/${seriesId}/candidates`);
  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }
  return response.json();
};
