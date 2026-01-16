import { promises as fs } from "fs";
import * as path from "path";

import { stringify } from "csv-stringify/sync";

/**
 * A service for writing data to CSV files.
 */
export class CsvWriter {
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
    headers?: (keyof T)[],
  ): Promise<void> {
    if (data.length === 0) {
      await fs.writeFile(filePath, "");
      return;
    }

    const resolvedHeaders = headers || (Object.keys(data[0]) as (keyof T)[]);
    const csvData = stringify(data, {
      header: true,
      columns: resolvedHeaders as string[],
    });

    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, csvData);
  }
}
