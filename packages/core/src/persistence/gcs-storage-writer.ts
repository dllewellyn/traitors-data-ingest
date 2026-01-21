import { Storage } from "@google-cloud/storage";
import { StorageWriter } from "./storage-writer";

export class GcsStorageWriter implements StorageWriter {
  private bucketName: string;
  private storage: Storage;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
    this.storage = new Storage();
  }

  async write(filePath: string, data: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);
    await file.save(data);
  }
}
