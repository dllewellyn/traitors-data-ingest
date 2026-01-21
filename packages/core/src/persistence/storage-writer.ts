/**
 * An interface for writing string-based data to a persistent storage system.
 */
export interface StorageWriter {
  /**
   * Writes data to a specified path.
   * @param filePath The relative path of the file to write.
   * @param data The string content to write.
   * @returns A promise that resolves when the write operation is complete.
   */
  write(filePath: string, data: string): Promise<void>;
}
