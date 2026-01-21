import { stringify } from "csv-stringify/sync";
import { StorageWriter } from "../persistence/storage-writer";

/**
 * A service for writing data to CSV files using a StorageWriter.
 */
export class CsvWriter {
  private writer: StorageWriter;

  constructor(writer: StorageWriter) {
    this.writer = writer;
  }

  /**
   * Writes an array of objects to a CSV file.
   *
   * @param data The array of objects to write.
   * @param filePath The path of the file to write to.
   * @param headers An optional array of headers. If not provided, the keys of the first object in the data array will be used.
   */
  public async write<T extends object>(
    data: T[],
    filePath: string,
    headers?: (keyof T)[]
  ): Promise<void> {
    if (data.length === 0) {
      await this.writer.write(filePath, "");
      return;
    }

    const resolvedHeaders = headers || (Object.keys(data[0]) as (keyof T)[]);
    const csvData = stringify(data, {
      header: true,
      columns: resolvedHeaders as string[],
    });

    await this.writer.write(filePath, csvData);
  }
}
