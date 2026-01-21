import { promises as fs } from "fs";
import * as path from "path";

import { CsvWriter } from "./CsvWriter";
import { LocalStorageWriter } from "../persistence/local-storage-writer";

describe("CsvWriter", () => {
  const outputDir = path.join(__dirname, "test-output");
  // Initialize writer in beforeEach to ensure clean state if needed, though here it's stateless
  let writer: CsvWriter;

  beforeEach(async () => {
    // Ensure clean directory
    await fs.rm(outputDir, { recursive: true, force: true });
    // LocalStorageWriter will create the directory on write
    const storageWriter = new LocalStorageWriter(outputDir);
    writer = new CsvWriter(storageWriter);
  });

  afterEach(async () => {
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it("should write a simple array of objects to a CSV file", async () => {
    const filePath = "simple.csv";
    const data = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    await writer.write(data, filePath);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe("id,name\n1,Alice\n2,Bob\n");
  });

  it("should handle an empty array by creating an empty file", async () => {
    const filePath = "empty.csv";
    const data: Record<string, unknown>[] = [];

    await writer.write(data, filePath);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe("");
  });

  it("should correctly escape commas, quotes, and newlines", async () => {
    const filePath = "special-chars.csv";
    const data = [
      {
        field1: "value with, a comma",
        field2: 'value with "a quote"',
        field3: "value with\na newline",
      },
    ];

    await writer.write(data, filePath);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    const expected =
      "field1,field2,field3\n" +
      '"value with, a comma","value with ""a quote""","value with\na newline"\n';
    expect(content).toBe(expected);
  });

  it("should create the directory if it does not exist", async () => {
    // LocalStorageWriter handles recursive directory creation relative to base path
    const filePath = path.join("a", "b", "c", "deep.csv");
    const data = [{ id: 1 }];

    await writer.write(data, filePath);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe("id\n1\n");
  });

  it("should use explicit headers when provided", async () => {
    const filePath = "headers.csv";
    const data = [{ id: 1, name: "Alice", extra: "field" }];

    await writer.write(data, filePath, ["id", "name"]);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe("id,name\n1,Alice\n");
  });
});
