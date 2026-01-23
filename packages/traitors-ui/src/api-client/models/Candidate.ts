/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Candidate = {
    /**
     * The unique identifier for the candidate.
     */
    id: number;
    /**
     * The name of the candidate.
     */
    name: string;
    /**
     * The ID of the series the candidate participated in.
     */
    seriesId: number;
    /**
     * The candidate's role in the game.
     */
    role: Candidate.role;
    /**
     * The final outcome for the candidate.
     */
    outcome: string;
};
export namespace Candidate {
    /**
     * The candidate's role in the game.
     */
    export enum role {
        FAITHFUL = 'Faithful',
        TRAITOR = 'Traitor',
    }
}
