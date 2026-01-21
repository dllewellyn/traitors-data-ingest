import { promises as fs } from "fs";
import * as path from "path";
import { LocalStorageWriter } from "./local-storage-writer";

describe("LocalStorageWriter", () => {
  const outputDir = path.join(__dirname, "test-output");
  const writer = new LocalStorageWriter(outputDir);

  beforeEach(async () => {
    // Ensure clean slate
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it("should write data to a file in the base directory", async () => {
    const filePath = "test.txt";
    const data = "Hello, world!";

    await writer.write(filePath, data);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe(data);
  });

  it("should create nested directories if they do not exist", async () => {
    const filePath = "nested/dir/test.txt";
    const data = "Nested content";

    await writer.write(filePath, data);

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe(data);
  });

  it("should overwrite existing files", async () => {
    const filePath = "overwrite.txt";
    await writer.write(filePath, "Initial content");
    await writer.write(filePath, "New content");

    const fullPath = path.join(outputDir, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).toBe("New content");
  });
});
