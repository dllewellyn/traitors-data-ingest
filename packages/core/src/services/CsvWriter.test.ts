import { promises as fs } from "fs";
import * as path from "path";

import { CsvWriter } from "./CsvWriter";
import { LocalStorageWriter } from "../persistence/local-storage-writer";

describe("CsvWriter", () => {
  const outputDir = path.join(__dirname, "test-output");
  const storageWriter = new LocalStorageWriter(outputDir);
  const writer = new CsvWriter(storageWriter);

  beforeEach(async () => {
    await fs.mkdir(outputDir, { recursive: true });
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

    const content = await fs.readFile(path.join(outputDir, filePath), "utf-8");
    expect(content).toBe("id,name\n1,Alice\n2,Bob\n");
  });

  it("should handle an empty array by creating an empty file", async () => {
    const filePath = "empty.csv";
    const data: Record<string, unknown>[] = [];

    await writer.write(data, filePath);

    const content = await fs.readFile(path.join(outputDir, filePath), "utf-8");
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

    const content = await fs.readFile(path.join(outputDir, filePath), "utf-8");
    const expected =
      "field1,field2,field3\n" +
      '"value with, a comma","value with ""a quote""","value with\na newline"\n';
    expect(content).toBe(expected);
  });

  it("should create the directory if it does not exist", async () => {
    // When using LocalStorageWriter, it handles directory creation within the baseDir.
    // So "a/b/c/deep.csv" is valid.
    const filePath = path.join("a", "b", "c", "deep.csv");
    const data = [{ id: 1 }];

    await writer.write(data, filePath);

    const content = await fs.readFile(path.join(outputDir, filePath), "utf-8");
    expect(content).toBe("id\n1\n");
  });

  it("should use explicit headers when provided", async () => {
    const filePath = "headers.csv";
    const data = [{ id: 1, name: "Alice", extra: "field" }];

    await writer.write(data, filePath, ["id", "name"]);

    const content = await fs.readFile(path.join(outputDir, filePath), "utf-8");
    expect(content).toBe("id,name\n1,Alice\n");
  });
});
