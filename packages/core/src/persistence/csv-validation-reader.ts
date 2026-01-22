import * as path from "path";
import { CsvReader } from "../services/CsvReader";
import { ValidationDataReader } from "./validation-data-reader.interface";
import { CandidateRow, VoteRow } from "../domain/validation";

export class CsvValidationReader implements ValidationDataReader {
  private readonly reader: CsvReader;
  private readonly dataDir: string;

  constructor(dataDir: string) {
    this.reader = new CsvReader();
    this.dataDir = dataDir;
  }

  public async readCandidates(): Promise<CandidateRow[]> {
    const filePath = path.join(this.dataDir, "all_candidates.csv");
    return this.reader.read<CandidateRow>(filePath);
  }

  public async readVotes(): Promise<VoteRow[]> {
    const filePath = path.join(this.dataDir, "all_votes.csv");
    return this.reader.read<VoteRow>(filePath);
  }
}
