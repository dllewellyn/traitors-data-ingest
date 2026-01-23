/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Candidate } from '../models/Candidate';
import type { Series } from '../models/Series';
import type { Vote } from '../models/Vote';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * List all series
     * Returns a list of all available series of The Traitors UK.
     * @returns Series A successful response with an array of series.
     * @throws ApiError
     */
    public static listSeries(): CancelablePromise<Array<Series>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/series',
        });
    }
    /**
     * Get a specific series
     * Returns detailed information for a single series.
     * @param seriesId
     * @returns Series A successful response with the series data.
     * @throws ApiError
     */
    public static getSeriesById(
        seriesId: number,
    ): CancelablePromise<Series> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/series/{seriesId}',
            path: {
                'seriesId': seriesId,
            },
            errors: {
                404: `Series not found.`,
            },
        });
    }
    /**
     * Get candidates for a series
     * Returns a list of all candidates who participated in a specific series.
     * @param seriesId
     * @param limit The maximum number of candidates to return.
     * @param offset The number of candidates to skip before starting to collect the result set.
     * @param sortBy The field to sort by.
     * @param sortOrder The order to sort by.
     * @returns Candidate A successful response with an array of candidates.
     * @throws ApiError
     */
    public static getCandidatesBySeries(
        seriesId: number,
        limit: number = 25,
        offset?: number,
        sortBy: 'name' = 'name',
        sortOrder: 'asc' | 'desc' = 'asc',
    ): CancelablePromise<Array<Candidate>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/series/{seriesId}/candidates',
            path: {
                'seriesId': seriesId,
            },
            query: {
                'limit': limit,
                'offset': offset,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
            },
            errors: {
                404: `Series not found.`,
            },
        });
    }
    /**
     * Get votes for a series
     * Returns a list of all votes cast in a specific series.
     * @param seriesId
     * @param limit The maximum number of votes to return.
     * @param offset The number of votes to skip before starting to collect the result set.
     * @returns Vote A successful response with an array of votes.
     * @throws ApiError
     */
    public static getVotesBySeries(
        seriesId: number,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<Array<Vote>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/series/{seriesId}/votes',
            path: {
                'seriesId': seriesId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                404: `Series not found.`,
            },
        });
    }
    /**
     * Get a specific candidate
     * Returns detailed information for a single candidate.
     * @param candidateId
     * @returns Candidate A successful response with the candidate data.
     * @throws ApiError
     */
    public static getCandidateById(
        candidateId: number,
    ): CancelablePromise<Candidate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/candidates/{candidateId}',
            path: {
                'candidateId': candidateId,
            },
            errors: {
                404: `Candidate not found.`,
            },
        });
    }
}
