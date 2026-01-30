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
    if (url.includes("The_Traitors_(British_series_2)")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/series2/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    if (url.includes("The_Traitors_(British_TV_series)_series_3")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/series3/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    if (url.includes("The_Traitors_(British_TV_series)_series_4")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/series4/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    if (url.includes("The_Traitors_(American_TV_series)_season_2")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/seriesUS2/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    if (url.includes("The_Traitors_(American_TV_series)_season_3")) {
      const fixturePath = path.resolve(
        __dirname,
        "../fixtures/seriesUS3/source.html"
      );
      return await fs.readFile(fixturePath, "utf-8");
    }
    throw new Error(`Unexpected URL: ${url}`);
  }
}
