import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

/**
 * A service for reading data from CSV files.
 */
export class CsvReader {
  /**
   * Reads a CSV file and returns an array of typed objects.
   *
   * @param filePath The path of the file to read.
   * @returns A promise that resolves to an array of objects.
   */
  public async read<T>(filePath: string): Promise<T[]> {
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
           if (context.header) return value;
           // Attempt to cast numbers
           if (!isNaN(Number(value)) && value.trim() !== "") {
             return Number(value);
           }
           return value;
        }
      });
      return records as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.warn(`File not found: ${filePath}`);
        return [];
      }
      throw error;
    }
  }
}
