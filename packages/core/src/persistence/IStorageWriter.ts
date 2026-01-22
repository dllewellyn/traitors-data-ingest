import { Series } from "../domain/series";

/**
 * Interface for writing Series data.
 * Implementations can persist data to Firestore, local storage, or perform a dry run.
 */
export interface IStorageWriter {
  /**
   * Writes (or simulates writing) a series object.
   * @param series The series data to write.
   */
  write(series: Series): Promise<void>;
}
