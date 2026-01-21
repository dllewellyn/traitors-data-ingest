import { IStorageWriter } from './IStorageWriter';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LocalStorageWriter implements IStorageWriter {
  constructor(private readonly basePath: string) {}

  async write(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.basePath, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}
