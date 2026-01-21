export interface StorageWriter {
  /**
   * Writes data to a specified path in the storage system.
   * @param filePath The relative path to the destination file (e.g., 'series-1/candidates.csv').
   * @param data The string content to write.
   */
  write(filePath: string, data: string): Promise<void>;
}
