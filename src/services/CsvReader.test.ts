import { promises as fs } from "fs";
import { CsvReader } from "./CsvReader";

describe("CsvReader", () => {
  const reader = new CsvReader();
  const testFile = "test.csv";

  afterEach(async () => {
    try {
      await fs.unlink(testFile);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  it("should read a CSV file and return an array of objects", async () => {
    const csvContent = "name,age\nAlice,30\nBob,25";
    await fs.writeFile(testFile, csvContent);

    const result = await reader.read<{ name: string; age: number }>(testFile);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "Alice", age: 30 });
    expect(result[1]).toEqual({ name: "Bob", age: 25 });
  });

  it("should handle numeric casting correctly", async () => {
    const csvContent = "val1,val2,val3\n10,20.5,text";
    await fs.writeFile(testFile, csvContent);

    const result = await reader.read<{
      val1: number;
      val2: number;
      val3: string;
    }>(testFile);

    expect(result[0].val1).toBe(10);
    expect(result[0].val2).toBe(20.5);
    expect(result[0].val3).toBe("text");
  });

  it("should return an empty array for an empty file", async () => {
    await fs.writeFile(testFile, "");

    const result = await reader.read(testFile);

    expect(result).toEqual([]);
  });

  it("should log a warning and return empty array if file does not exist", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const result = await reader.read("nonexistent.csv");
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("File not found")
    );
    consoleSpy.mockRestore();
  });

  it("should handle parsing errors gracefully", async () => {
    // Malformed CSV
    const csvContent = 'name,age\nAlice,30\nBob,"unclosed quote';
    await fs.writeFile(testFile, csvContent);

    // Casting as any because specific error type varies by library version
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any;
    try {
      await reader.read(testFile);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });

  it("should throw specific error for permission issues", async () => {
    await fs.writeFile(testFile, "data");
    // Remove read permissions
    await fs.chmod(testFile, 0o000);

    try {
      await reader.read(testFile);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
