import * as fs from 'fs/promises';
import * as path from 'path';
import { FileBasedFetcher } from '../mocks/FileBasedFetcher';
import { Series1CandidateParser } from '../../src/scrapers/series1/Series1CandidateParser';
import { Series1ProgressParser } from '../../src/scrapers/series1/Series1ProgressParser';
import { CsvWriter } from '../../src/services/CsvWriter';

describe('Series 1 Scraper Integration Snapshot', () => {
  let tempDir: string;
  const fetcher = new FileBasedFetcher();
  const url = 'https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)';

  beforeEach(async () => {
    tempDir = await fs.mkdtemp('series1-test-');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should match the snapshot', async () => {
    // 1. Fetch
    const html = await fetcher.fetch(url);

    // 2. Parse Candidates
    const candidateParser = new Series1CandidateParser();
    const candidates = candidateParser.parse(html);

    // 3. Parse Progress (Votes)
    const progressParser = new Series1ProgressParser();
    const progress = progressParser.parse(html);

    // 4. Write CSVs
    const csvWriter = new CsvWriter();
    const candidatesPath = path.join(tempDir, 'candidates.csv');
    const votesPath = path.join(tempDir, 'votes.csv');

    // Need to flatten complex objects for CSV if CsvWriter doesn't do it automatically.
    // However, CsvWriter uses `csv-stringify` which handles basic objects.
    // But `roundStates` is an array of objects, and `progress` is an object (map).
    // We likely need to verify what the "expected" CSV format is.
    // For now, let's dump what we have.
    // The previous prompt mentioned structured CSV files.

    // For Candidate: roundStates is a complex object.
    // For Progress: progress is a map.

    // Let's assume for this test we serialize them "as is" or minimal transformation
    // to match what the user likely wants.
    // But since the task is just "Verify S1 output matches expected snapshot",
    // and I am creating the snapshot now, I can define the format.

    // Candidates has `roundStates` which is an array. csv-stringify usually JSON stringifies arrays/objects in cells.

    // Let's prepare data for CSV if needed.
    const candidateRows = candidates.map(c => ({
        ...c,
        roundStates: JSON.stringify(c.roundStates)
    }));

    const progressRows = progress.map(p => ({
        ...p,
        progress: JSON.stringify(p.progress)
    }));

    await csvWriter.write(candidateRows, candidatesPath);
    await csvWriter.write(progressRows, votesPath);

    // 5. Compare with Golden Snapshots
    const expectedCandidatesPath = path.resolve(__dirname, '../fixtures/series1/expected-candidates.csv');
    const expectedVotesPath = path.resolve(__dirname, '../fixtures/series1/expected-votes.csv');

    // If snapshots don't exist, we can't compare.
    // But for the purpose of the plan, I will read them.
    // This allows me to use this test to generate them (by manually copying temp to expected).

    let expectedCandidates = '';
    let expectedVotes = '';

    try {
        expectedCandidates = await fs.readFile(expectedCandidatesPath, 'utf-8');
        expectedVotes = await fs.readFile(expectedVotesPath, 'utf-8');
    } catch (e) {
        // If files missing, we might be in generation mode.
        console.warn("Snapshot files not found. Using empty string for comparison.");
    }

    const actualCandidates = await fs.readFile(candidatesPath, 'utf-8');
    const actualVotes = await fs.readFile(votesPath, 'utf-8');

    // If expected is empty (first run), fail with a message showing where the actuals are?
    // Or just write them to console so I can see them.

    if (!expectedCandidates) {
        // Log the output so I can save it to the file in the next step
        console.log("ACTUAL CANDIDATES CSV:\n", actualCandidates);
        console.log("ACTUAL VOTES CSV:\n", actualVotes);
    }

    expect(actualCandidates).toEqual(expectedCandidates);
    expect(actualVotes).toEqual(expectedVotes);
  });
});
