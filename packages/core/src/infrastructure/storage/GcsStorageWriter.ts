import { IStorageWriter } from './IStorageWriter';
import { Storage } from '@google-cloud/storage';

export class GcsStorageWriter implements IStorageWriter {
  private readonly storage = new Storage();
  constructor(private readonly bucketName: string) {}

  async write(filePath: string, content: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);
    await file.save(content, { contentType: 'text/csv' });
  }
}
