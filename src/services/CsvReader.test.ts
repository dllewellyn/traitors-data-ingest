import { CsvReader } from "./CsvReader";
import { promises as fs } from "fs";

// Only mock fs, use real csv-parse
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe("CsvReader", () => {
  let reader: CsvReader;
  const mockReadFile = fs.readFile as jest.Mock;

  beforeEach(() => {
    reader = new CsvReader();
    jest.clearAllMocks();
  });

  it("should read and parse a CSV file successfully using real parser", async () => {
    // Provide real CSV content
    const fileContent = "id,name\n1,Alice";
    mockReadFile.mockResolvedValue(fileContent);

    const result = await reader.read<{ id: number; name: string }>("test.csv");

    expect(mockReadFile).toHaveBeenCalledWith("test.csv", "utf-8");
    expect(result).toEqual([{ id: 1, name: "Alice" }]);
  });

  it("should cast numbers correctly", async () => {
    const fileContent = "val1,val2,val3\n123,45.6,hello";
    mockReadFile.mockResolvedValue(fileContent);

    const result = await reader.read<{
      val1: number;
      val2: number;
      val3: string;
    }>("test.csv");

    expect(result).toHaveLength(1);
    expect(result[0].val1).toBe(123);
    expect(result[0].val2).toBe(45.6);
    expect(result[0].val3).toBe("hello");
  });

  it("should handle empty strings in casting", async () => {
    const fileContent = "col1,col2\n,  ";
    mockReadFile.mockResolvedValue(fileContent);

    const result = await reader.read<{ col1: string; col2: string }>(
      "test.csv"
    );

    // Default csv-parse behavior + our trim: true might affect this.
    // Our cast: if (value.trim() !== "") ...
    // "  ".trim() is "" -> returns value "  " (because trim:true in options handles the trim before cast? No, cast runs on raw usually or after trim depending on config)
    // Actually `trim: true` in options means the value passed to cast is already trimmed?
    // Let's rely on the real behavior.

    expect(result).toHaveLength(1);
    // Since trim: true is set, whitespace becomes empty string usually?
    // Let's verify what we get.
    // If input is empty string in CSV (,,), value is "". Number("") is 0.
    // But value.trim() !== "" prevents it becoming 0. So it returns "".
    expect(result[0].col1).toBe("");
  });

  it("should return an empty array if file not found (ENOENT)", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";
    mockReadFile.mockRejectedValue(error);

    // Suppress console.warn for this test
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await reader.read("missing.csv");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("File not found")
    );

    consoleSpy.mockRestore();
  });

  it("should throw error for non-ENOENT errors", async () => {
    const error = new Error("Permission denied");
    mockReadFile.mockRejectedValue(error);

    await expect(reader.read("protected.csv")).rejects.toThrow(
      "Permission denied"
    );
  });
});
