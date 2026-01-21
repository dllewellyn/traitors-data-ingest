import { Bucket } from "@google-cloud/storage";
import { StorageWriter } from "./storage-writer";

export class GcsStorageWriter implements StorageWriter {
  private bucket: Bucket;

  constructor(bucket: Bucket) {
    this.bucket = bucket;
  }

  async write(filePath: string, data: string): Promise<void> {
    const file = this.bucket.file(filePath);
    await file.save(data);
  }
}
