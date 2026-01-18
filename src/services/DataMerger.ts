import { Candidate, Vote } from "../domain/models";
import { CandidateProgressRow } from "../scrapers/types";

/**
 * Service for merging data from multiple series.
 */
export class DataMerger {
  /**
   * Merges multiple arrays of candidates into a single array.
   * @param datasets An array of candidate arrays.
   * @returns A flattened array of all candidates.
   */
  mergeCandidates(datasets: Candidate[][]): Candidate[] {
    return datasets.flat();
  }

  /**
   * Converts progress rows into Vote objects.
   * @param series The series number.
   * @param candidates The list of candidates for the series (to map names to IDs).
   * @param progressRows The progress rows from the scraper.
   * @returns An array of Vote objects.
   */
  processVotes(
    series: number,
    candidates: Candidate[],
    progressRows: CandidateProgressRow[]
  ): Vote[] {
    const votes: Vote[] = [];
    const candidateMap = new Map<string, number>();

    // Create a robust map of names to IDs
    candidates.forEach((c) => {
      const id = c.id;
      // 1. Full name lowercased
      candidateMap.set(c.name.toLowerCase(), id);

      // 2. Nickname extraction: Madelyn "Maddy" Smedley or Charlie 'Chaz' Brown
      const nicknameMatch = c.name.match(/["']([^"']+)["']/);
      if (nicknameMatch) {
        candidateMap.set(nicknameMatch[1].toLowerCase(), id);
      }

      // 3. First name
      const firstName = c.name.split(" ")[0].toLowerCase();
      // Only set first name if it's not already taken (to avoid collisions)
      // or simplistic overwrite (last write wins).
      // For The Traitors, duplicate first names usually have initial (e.g. Tom E, Tom M).
      // So checking collision is safer, but "Tom" usually refers to the one without initial if unique?
      // Let's just set it.
      if (!candidateMap.has(firstName)) {
        candidateMap.set(firstName, id);
      }
    });

    progressRows.forEach((row) => {
      const voterName = row.name;
      const voterId = candidateMap.get(voterName.toLowerCase());

      // Try nickname resolution for voter if direct lookup fails
      if (voterId === undefined) {
        // Maybe voterName is a first name?
        // Included in map now.
      }

      if (voterId === undefined) {
        console.warn(
          `Series ${series}: Could not find voter ID for '${voterName}'`
        );
        return;
      }

      Object.entries(row.progress).forEach(([episodeStr, statusOrVote]) => {
        const episode = parseInt(episodeStr, 10);
        const voteTargetName = statusOrVote.trim();

        // Skip empty or known status values
        const knownStatuses = [
          "Traitor",
          "Faithful",
          "Banished",
          "Murdered",
          "Eliminated",
          "Winner",
          "Runner-up",
          "Recruited",
          "Safe",
          "Active",
          "Participating",
          "Hospitalised",
          "Withdrew",
          "Removed",
        ];

        if (
          knownStatuses.some(
            (s) => s.toLowerCase() === voteTargetName.toLowerCase()
          )
        ) {
          return;
        }

        const targetId = candidateMap.get(voteTargetName.toLowerCase());

        if (targetId !== undefined) {
          votes.push({
            series,
            voterId: voterId,
            targetId,
            round: episode,
            episode,
          });
        } else {
          console.warn(
            `Series ${series}: Could not resolve vote target '${voteTargetName}' for voter '${voterName}' in episode ${episode}.`
          );
        }
      });
    });

    return votes;
  }

  /**
   * Merges multiple arrays of votes into a single array.
   * @param datasets An array of vote arrays.
   * @returns A flattened array of all votes.
   */
  mergeVotes(datasets: Vote[][]): Vote[] {
    return datasets.flat();
  }
}
