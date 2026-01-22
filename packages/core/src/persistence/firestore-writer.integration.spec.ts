import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { FirestoreStorageWriter } from "./firestore-writer";
import { Series } from "../domain/series";
import { Role } from "../domain/enums";

// Only run this suite if the emulator is available
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
const PROJECT_ID = "demo-test";

describe("FirestoreStorageWriter Integration", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;

  beforeAll(() => {
    // Prevent re-initialization error
    try {
      initializeApp({ projectId: PROJECT_ID });
    } catch {
      // already initialized
    }
    db = getFirestore();
    // In strict mode, we might need to connect explicitely if env var is not set,
    // but usually FIRESTORE_EMULATOR_HOST is enough for admin SDK.
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;
    }
  });

  // We skip if we can't connect, but for this task we assume we will run it with emulator
  it("should write data to the Firestore emulator", async () => {
    const writer = new FirestoreStorageWriter(db);

    const seriesId = "INTEGRATION_TEST_S1";
    const series: Series = {
      id: seriesId,
      seriesNumber: 99,
      candidates: [
        {
          id: 9901,
          name: "Integration Alice",
          series: 99,
          roundStates: [],
          age: 25,
          job: "Tester",
          location: "Cloud",
          originalRole: Role.Faithful,
        },
      ],
      votes: [],
    };

    await writer.write(series);

    // Verify by reading back
    const seriesDoc = await db.collection("series").doc(seriesId).get();
    expect(seriesDoc.exists).toBe(true);
    expect(seriesDoc.data()).toMatchObject({ id: seriesId, seriesNumber: 99 });

    const candidateId = `${seriesId}_INTEGRATION_ALICE`;
    const candidateDoc = await db.collection("candidates").doc(candidateId).get();
    expect(candidateDoc.exists).toBe(true);
    expect(candidateDoc.data()).toMatchObject({ name: "Integration Alice", seriesId: seriesId });
  });
});
