import * as fs from "fs/promises";
import * as path from "path";
import { IWikipediaFetcher } from "../../src/services/WikipediaFetcher";

export class FileBasedFetcher implements IWikipediaFetcher {
  public async fetch(url: string): Promise<string> {
    if (url.includes("The_Traitors_(British_series_1)")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/series1/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    throw new Error(`Unexpected URL: ${url}`);
  }
}
