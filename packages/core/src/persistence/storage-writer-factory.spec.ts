import { createStorageWriter } from "./storage-writer-factory";
import { DryRunStorageWriter } from "./DryRunStorageWriter";
import { FirestoreStorageWriter } from "./firestore-writer";
import { getFirestore } from "firebase-admin/firestore";

jest.mock("./DryRunStorageWriter");
jest.mock("./firestore-writer");
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(),
}));

describe("storage-writer-factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return DryRunStorageWriter when dryRun is true", () => {
    const writer = createStorageWriter({ dryRun: true });
    expect(writer).toBeInstanceOf(DryRunStorageWriter);
    expect(DryRunStorageWriter).toHaveBeenCalled();
    expect(FirestoreStorageWriter).not.toHaveBeenCalled();
  });

  it("should return FirestoreStorageWriter when firestoreInstance is provided", () => {
    const mockFirestore = {} as any;
    const writer = createStorageWriter({ firestore: mockFirestore });
    expect(writer).toBeInstanceOf(FirestoreStorageWriter);
    expect(FirestoreStorageWriter).toHaveBeenCalledWith(mockFirestore);
  });

  it("should return FirestoreStorageWriter with default firestore when no options provided", () => {
    const mockDefaultFirestore = { id: "default" };
    (getFirestore as jest.Mock).mockReturnValue(mockDefaultFirestore);

    const writer = createStorageWriter();
    expect(writer).toBeInstanceOf(FirestoreStorageWriter);
    expect(getFirestore).toHaveBeenCalled();
    expect(FirestoreStorageWriter).toHaveBeenCalledWith(mockDefaultFirestore);
  });
});
