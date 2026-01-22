import { firestore } from "firebase-admin";
import { ValidationDataReader } from "./validation-data-reader.interface";
import { CandidateRow, VoteRow } from "../domain/validation";
import { Candidate, Vote } from "../domain/models";

export class FirestoreValidationReader implements ValidationDataReader {
  private readonly db: firestore.Firestore;

  constructor(db: firestore.Firestore) {
    this.db = db;
  }

  public async readCandidates(): Promise<CandidateRow[]> {
    const snapshot = await this.db.collection("candidates").get();
    return snapshot.docs.map((doc) => {
      // Cast the Firestore data to the domain interface.
      // Note: We assume the data in Firestore matches the domain model.
      const data = doc.data() as Candidate;
      return {
        id: data.id,
        name: data.name,
        series: data.series,
        originalRole: data.originalRole,
      };
    });
  }

  public async readVotes(): Promise<VoteRow[]> {
    const snapshot = await this.db.collection("votes").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Vote;
      return {
        series: data.series,
        voterId: data.voterId,
        targetId: data.targetId,
        round: data.round,
        episode: data.episode,
      };
    });
  }
}
