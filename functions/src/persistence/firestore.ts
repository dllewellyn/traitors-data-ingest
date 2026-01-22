import { getFirestore } from "firebase-admin/firestore";
import { Series, Candidate } from "@gcp-adl/core";

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

export const getCandidatesBySeriesNumber = async (seriesNumber: number): Promise<Candidate[]> => {
  const db = getDb();
  const seriesId = `TRAITORS_UK_S${seriesNumber}`;
  const snapshot = await db.collection("candidates").where("seriesId", "==", seriesId).get();

  return snapshot.docs.map(doc => doc.data() as Candidate);
};
