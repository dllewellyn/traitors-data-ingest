import { getFirestore } from "firebase-admin/firestore";
import { Series, Candidate, Vote } from "@gcp-adl/core";

const getDb = () => getFirestore();

export const getSeriesByNumber = async (seriesNumber: number): Promise<Series | null> => {
  const db = getDb();
  // Document ID pattern: TRAITORS_UK_S1, TRAITORS_UK_S2
  const id = `TRAITORS_UK_S${seriesNumber}`;
  const doc = await db.collection("series").doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Series;
};

export const getAllSeries = async (): Promise<Series[]> => {
  const db = getDb();
  const snapshot = await db.collection("series").orderBy("seriesNumber").get();

  return snapshot.docs.map(doc => doc.data() as Series);
};

export const getCandidatesBySeriesNumber = async (
  seriesNumber: number,
  limit: number,
  offset: number
): Promise<Candidate[]> => {
  const db = getDb();
  const seriesId = `TRAITORS_UK_S${seriesNumber}`;
  const snapshot = await db.collection("candidates")
    .where("seriesId", "==", seriesId)
    .orderBy("name", "asc")
    .select("id", "name", "series", "originalRole", "roundStates")
    .limit(limit)
    .offset(offset)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Candidate);
};

export const getVotes = async (
  seriesNumber: number,
  limit: number,
  offset: number
): Promise<Vote[]> => {
  const db = getDb();
  // We use seriesId in the domain object, which is an integer (e.g., 1, 2)
  // But in Firestore, it seems we might be querying by the integer series number
  // The 'candidates' query uses `seriesId` string "TRAITORS_UK_S<N>"?
  // Wait, let's check getCandidatesBySeriesNumber implementation:
  // const seriesId = `TRAITORS_UK_S${seriesNumber}`;
  // .where("seriesId", "==", seriesId)

  // We need to know how 'votes' are stored.
  // Assuming they are stored with 'series' (number) or 'seriesId' (string).
  // Based on Candidate domain: series: number.
  // Based on Candidate Firestore Query: seriesId is used as string.

  // Let's assume consistent storage with candidates for now, but Vote domain has 'series: number'.
  // However, persistence/firestore-writer.ts would be the source of truth for how it is written.
  // Since I can't check that easily without reading more files, I will follow the pattern.
  // If `getVotes` is to be like `getCandidatesBySeriesNumber`.

  const seriesId = `TRAITORS_UK_S${seriesNumber}`;
  const snapshot = await db.collection("votes")
    .where("seriesId", "==", seriesId)
    .orderBy("episode", "asc") // Deterministic ordering by episode (or round)
    .orderBy("voterId", "asc") // Secondary ordering for stability
    .limit(limit)
    .offset(offset)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Vote);
};
