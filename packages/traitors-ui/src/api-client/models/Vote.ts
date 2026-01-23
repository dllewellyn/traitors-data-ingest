/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Vote = {
    /**
     * The unique identifier for the vote event.
     */
    id: number;
    /**
     * The episode number in which the vote occurred.
     */
    episode: number;
    /**
     * The ID of the candidate who cast the vote.
     */
    voterId: number;
    /**
     * The ID of the candidate who received the vote.
     */
    votedForId: number;
    /**
     * The ID of the series this vote belongs to.
     */
    seriesId: number;
};
