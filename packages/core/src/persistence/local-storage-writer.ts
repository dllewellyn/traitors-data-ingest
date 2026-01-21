import { promises as fs } from "fs";
import * as path from "path";
import { StorageWriter } from "./storage-writer";

export class LocalStorageWriter implements StorageWriter {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async write(filePath: string, data: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, data);
  }
}
