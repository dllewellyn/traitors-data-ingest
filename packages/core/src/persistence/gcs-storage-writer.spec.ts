import { Storage } from "@google-cloud/storage";
import { GcsStorageWriter } from "./gcs-storage-writer";

// Mock @google-cloud/storage
jest.mock("@google-cloud/storage");

describe("GcsStorageWriter", () => {
  const bucketName = "test-bucket";
  let writer: GcsStorageWriter;
  let mockStorage: jest.Mocked<Storage>;
  let mockBucket: any;
  let mockFile: any;

  beforeEach(() => {
    mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    };
    mockStorage = new Storage() as jest.Mocked<Storage>;
    mockStorage.bucket = jest.fn().mockReturnValue(mockBucket);

    // Reset mocks for class instantiation
    (Storage as unknown as jest.Mock).mockImplementation(() => mockStorage);

    writer = new GcsStorageWriter(bucketName);
  });

  it("should write data to the specified bucket and file", async () => {
    const filePath = "folder/file.txt";
    const data = "some content";

    await writer.write(filePath, data);

    expect(mockStorage.bucket).toHaveBeenCalledWith(bucketName);
    expect(mockBucket.file).toHaveBeenCalledWith(filePath);
    expect(mockFile.save).toHaveBeenCalledWith(data);
  });
});
