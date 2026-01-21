import { createStorageWriter } from './StorageWriterFactory';
import { LocalStorageWriter } from './LocalStorageWriter';
import { GcsStorageWriter } from './GcsStorageWriter';

jest.mock('./LocalStorageWriter');
jest.mock('./GcsStorageWriter');

describe('StorageWriterFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return LocalStorageWriter if FUNCTIONS_EMULATOR is true', () => {
    process.env.FUNCTIONS_EMULATOR = 'true';
    const writer = createStorageWriter();
    expect(LocalStorageWriter).toHaveBeenCalled();
  });

  it('should return GcsStorageWriter if GCS_BUCKET is set', () => {
    delete process.env.FUNCTIONS_EMULATOR;
    process.env.GCS_BUCKET = 'test-bucket';
    const writer = createStorageWriter();
    expect(GcsStorageWriter).toHaveBeenCalledWith('test-bucket');
  });

  it('should throw if neither is set', () => {
    delete process.env.FUNCTIONS_EMULATOR;
    delete process.env.GCS_BUCKET;
    expect(() => createStorageWriter()).toThrow('GCS_BUCKET environment variable is not set.');
  });
});
