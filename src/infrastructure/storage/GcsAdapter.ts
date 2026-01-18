import { Storage } from "@google-cloud/storage";
import { StoragePort } from "./StoragePort";

export class GcsAdapter implements StoragePort {
  private storage: Storage;
  private bucketName: string;

  constructor(bucketName: string) {
    this.storage = new Storage();
    this.bucketName = bucketName;
  }

  async save(filePath: string, content: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);
    await file.save(content);
  }
}
