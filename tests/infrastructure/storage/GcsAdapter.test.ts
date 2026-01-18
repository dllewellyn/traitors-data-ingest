// Define mocks first, but jest.mock hoist is tricky.
// We can use factory variable pattern if we name it "mock..." but better to define inline or use proper jest pattern.

// Let's rely on standard jest mock auto-hoisting behavior limitation workaround.
// We can define the mock implementation inside the factory.

const mockSave = jest.fn();
const mockFile = jest.fn(() => ({
  save: mockSave,
}));
const mockBucket = jest.fn(() => ({
  file: mockFile,
}));
const mockStorageInstance = {
  bucket: mockBucket,
};

// We need to suppress the hoisting issue by using require or moving logic.
// Simplest way is to define variables that are not used in factory directly but setup later,
// OR just define the factory cleanly.

jest.mock("@google-cloud/storage", () => {
  return {
    Storage: jest.fn().mockImplementation(() => {
      return {
        bucket: (name: string) => ({
          file: (path: string) => ({
            save: mockSave // We can refer to out-of-scope var if it starts with 'mock' in some jest versions, but safe way is:
          })
        })
      };
    })
  };
});

// Re-write to avoid closure issues.
import { GcsAdapter } from "../../../src/infrastructure/storage/GcsAdapter";
import { Storage } from "@google-cloud/storage";

// Reset modules to ensure clean mock
jest.mock("@google-cloud/storage");

describe("GcsAdapter", () => {
  let adapter: GcsAdapter;
  const bucketName = "test-bucket";
  let mockSave: jest.Mock;
  let mockFile: jest.Mock;
  let mockBucket: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSave = jest.fn().mockResolvedValue(undefined);
    mockFile = jest.fn().mockReturnValue({ save: mockSave });
    mockBucket = jest.fn().mockReturnValue({ file: mockFile });

    (Storage as unknown as jest.Mock).mockImplementation(() => ({
      bucket: mockBucket
    }));

    adapter = new GcsAdapter(bucketName);
  });

  it("should save content to the specified path in GCS", async () => {
    const filePath = "test/file.csv";
    const content = "header1,header2\nval1,val2";

    await adapter.save(filePath, content);

    expect(Storage).toHaveBeenCalled();
    expect(mockBucket).toHaveBeenCalledWith(bucketName);
    expect(mockFile).toHaveBeenCalledWith(filePath);
    expect(mockSave).toHaveBeenCalledWith(content);
  });

  it("should propagate errors from GCS", async () => {
    const error = new Error("GCS Error");
    mockSave.mockRejectedValueOnce(error);

    await expect(adapter.save("path", "content")).rejects.toThrow("GCS Error");
  });
});
