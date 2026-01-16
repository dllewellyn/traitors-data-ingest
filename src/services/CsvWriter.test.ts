import { CsvWriter } from "./CsvWriter";
import { promises as fs } from "fs";
import * as path from "path";

describe("CsvWriter", () => {
  const outputDir = path.join(__dirname, "test-output");
  const writer = new CsvWriter();

  beforeEach(async () => {
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it("should write a simple array of objects to a CSV file", async () => {
    const filePath = path.join(outputDir, "simple.csv");
    const data = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    await writer.write(data, filePath);

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toBe("id,name\n1,Alice\n2,Bob\n");
  });

  it("should handle an empty array by creating an empty file", async () => {
    const filePath = path.join(outputDir, "empty.csv");
    const data: any[] = [];

    await writer.write(data, filePath);

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toBe("");
  });

  it("should correctly escape commas, quotes, and newlines", async () => {
    const filePath = path.join(outputDir, "special-chars.csv");
    const data = [
      {
        field1: 'value with, a comma',
        field2: 'value with "a quote"',
        field3: 'value with\na newline',
      },
    ];

    await writer.write(data, filePath);

    const content = await fs.readFile(filePath, "utf-8");
    const expected =
      'field1,field2,field3\n' +
      '"value with, a comma","value with ""a quote""","value with\na newline"\n';
    expect(content).toBe(expected);
  });

  it("should create the directory if it does not exist", async () => {
    const deepOutputDir = path.join(outputDir, "a", "b", "c");
    const filePath = path.join(deepOutputDir, "deep.csv");
    const data = [{ id: 1 }];

    await writer.write(data, filePath);

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toBe("id\n1\n");
  });

  it("should use explicit headers when provided", async () => {
    const filePath = path.join(outputDir, "headers.csv");
    const data = [{ id: 1, name: "Alice", extra: "field" }];

    await writer.write(data, filePath, ["id", "name"]);

    const content = await fs.readFile(filePath, "utf-8");
    expect(content).toBe("id,name\n1,Alice\n");
  });
});
