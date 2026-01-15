import { Role } from "./enums";

export interface CandidateRow {
  id: number;
  name: string;
  age: number;
  job: string;
  location: string;
  originalRole: Role;
}

export interface VoteRow {
  series: number;
  episode: number;
  round: number;
  voter: string;
  target: string;
  role: Role;
}

export interface EpisodeRow {
  series: number;
  episode: number;
  airDate: string;
}
