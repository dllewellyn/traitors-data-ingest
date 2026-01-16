import { Status } from "../domain/enums";
import { RoundState } from "../domain/models";

/**
 * Parses the "Finish" text from the Wikipedia table into a RoundState object.
 * @param finishText The text to parse (e.g., "Murdered (Episode 2)").
 * @returns A RoundState object or null if the text cannot be parsed.
 */
export const parseFinishText = (finishText: string): RoundState | null => {
  if (!finishText) {
    return null;
  }

  const parts = finishText.match(/(.+?)(?: \(Episode (\d+)\))?$/);
  if (!parts) {
    return null;
  }

  const statusText = parts[1].trim();
  const episode = parts[2] ? parseInt(parts[2], 10) : 0;

  let status: Status;
  switch (statusText) {
    case "Murdered":
      status = Status.Murdered;
      break;
    case "Banished":
      status = Status.Banished;
      break;
    case "Winner":
      status = Status.Winner;
      break;
    default:
      return null;
  }

  // The role is not available in the finish text, so we'll have to handle it later.
  // For now, we'll leave it as a placeholder.
  return {
    episode,
    status,
    role: null as any,
  };
};
