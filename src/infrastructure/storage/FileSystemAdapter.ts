import { promises as fs } from "fs";
import * as path from "path";
import { StoragePort } from "./StoragePort";

export class FileSystemAdapter implements StoragePort {
  async save(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);
  }
}
