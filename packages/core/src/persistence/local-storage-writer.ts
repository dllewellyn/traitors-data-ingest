import { promises as fs } from "fs";
import * as path from "path";
import { StorageWriter } from "./storage-writer";

export class LocalStorageWriter implements StorageWriter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async write(filePath: string, data: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, data);
  }
}
