export interface IStorageWriter {
  /**
   * Writes content to a specified path.
   * @param filePath The destination path (e.g., 'series-1/candidates.csv').
   * @param content The string content to write.
   */
  write(filePath: string, content: string): Promise<void>;
}
