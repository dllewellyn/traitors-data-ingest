import { firestore } from "firebase-admin";
import { Series } from "../domain/series";

/**
 * Persists series data to Cloud Firestore.
 */
export class FirestoreStorageWriter {
  private readonly db: firestore.Firestore;

  constructor(db: firestore.Firestore) {
    this.db = db;
  }

  /**
   * Writes a complete series to Firestore using a batch operation.
   * Note: Firestore batches are limited to 500 operations.
   * If a series exceeds this (unlikely for current data sizes), this method should be refactored to chunk writes.
   *
   * @param series The series data to write.
   */
  public async write(series: Series): Promise<void> {
    const batch = this.db.batch();

    // 1. Write Series Document
    const seriesRef = this.db.collection("series").doc(series.id);
    batch.set(seriesRef, {
      id: series.id,
      seriesNumber: series.seriesNumber,
      // We can add title or year if we ever add them to the Series model
    });

    // 2. Write Candidates
    for (const candidate of series.candidates) {
      // Generate a deterministic Document ID
      // Format: {SERIES_ID}_{CANDIDATE_NAME_SANITIZED}
      // e.g. TRAITORS_UK_S1_AARON
      const sanitizedName = candidate.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase();
      const docId = `${series.id}_${sanitizedName}`;

      const ref = this.db.collection("candidates").doc(docId);
      batch.set(ref, {
        ...candidate,
        seriesId: series.id, // Explicitly link to string ID
      });
    }

    // 3. Write Votes
    for (const vote of series.votes) {
      // Generate a deterministic Document ID
      // Format: {SERIES_ID}_EP{EPISODE}_R{ROUND}_V{VOTER_ID}_T{TARGET_ID}
      const docId = `${series.id}_EP${vote.episode}_R${vote.round}_V${vote.voterId}_T${vote.targetId}`;

      const ref = this.db.collection("votes").doc(docId);
      batch.set(ref, {
        ...vote,
        seriesId: series.id, // Explicitly link to string ID
      });
    }

    await batch.commit();
  }
}
