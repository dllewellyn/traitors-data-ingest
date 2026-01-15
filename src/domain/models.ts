import { Role, Status } from "./enums";

export interface RoundState {
  episode: number;
  role: Role;
  status: Status;
}

export interface Candidate {
  id: number;
  name: string;
  age: number;
  job: string;
  location: string;
  originalRole: Role;
  roundStates: RoundState[];
}

export interface Episode {
  series: number;
  episodeNumber: number;
  airDate: Date;
}

export interface Vote {
  voterId: number;
  targetId: number;
  round: number;
  episode: number;
}
