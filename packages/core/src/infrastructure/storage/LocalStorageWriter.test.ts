import { LocalStorageWriter } from './LocalStorageWriter';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('LocalStorageWriter', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp('local-storage-test-');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should write content to a file', async () => {
    const writer = new LocalStorageWriter(tempDir);
    await writer.write('test.txt', 'hello world');

    const content = await fs.readFile(path.join(tempDir, 'test.txt'), 'utf-8');
    expect(content).toBe('hello world');
  });

  it('should create nested directories', async () => {
    const writer = new LocalStorageWriter(tempDir);
    await writer.write('nested/dir/test.txt', 'hello world');

    const content = await fs.readFile(path.join(tempDir, 'nested/dir/test.txt'), 'utf-8');
    expect(content).toBe('hello world');
  });
});
