import { IStorageWriter } from './IStorageWriter';
import { LocalStorageWriter } from './LocalStorageWriter';
import { GcsStorageWriter } from './GcsStorageWriter';
import * as path from 'path';

export const createStorageWriter = (): IStorageWriter => {
  // Firebase Emulator sets this environment variable automatically.
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    // In the emulator, process.cwd() is usually the 'functions' directory.
    // We want to write to the 'data' directory in the project root.
    const isFunctionsDir = process.cwd().endsWith('functions');
    const basePath = isFunctionsDir
      ? path.resolve(process.cwd(), '../data')
      : path.resolve(process.cwd(), 'data');

    return new LocalStorageWriter(basePath);
  }

  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    throw new Error('GCS_BUCKET environment variable is not set.');
  }
  return new GcsStorageWriter(bucketName);
};
