import { Status } from "../domain/enums";

/**
 * Represents the parsed result from the "Finish" text.
 */
export interface ParsedFinishText {
  status: Status;
  episode: number;
}

/**
 * Parses the "Finish" text from the Wikipedia table.
 * @param finishText The text to parse (e.g., "Murdered (Episode 2)").
 * @returns A ParsedFinishText object or null if the text cannot be parsed.
 */
export const parseFinishText = (
  finishText: string
): ParsedFinishText | null => {
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

  return {
    episode,
    status,
  };
};
