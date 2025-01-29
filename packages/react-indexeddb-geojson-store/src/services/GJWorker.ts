import dexie from "dexie";
import { CountryMetadata } from "../types/CountryMetadata";
import { download } from "@eria-viz/download";
import { GJService } from "./GJService";

type DownloadTarget = {
  url: string;
  filename: string;
  countryMetadataIndex: number;
  adminLevel: number;
};

type DownloadStatus = DownloadTarget & {
  value: number;
  max: number;
};

export async function downloadGeoJSON(
  databaseName: string,
  countryMetadataArray: CountryMetadata[],
  checkboxMatrix: boolean[][],
  onProgress: (
    countryMetadataIndex: number,
    adminLevel: number,
    value: number,
    max: number,
  ) => void,
): Promise<void> {
  const downloadTargetList = countryMetadataArray.map(
    (countryMetadata: CountryMetadata, countryMetadataIndex: number) => {
      checkboxMatrix[countryMetadataIndex].map(
        (checked: boolean, adminLevel: number) => {
          if (checked) {
            return {
              url: GJService.createGeoJsonDownloadURL(
                countryMetadata.countryCode,
                adminLevel,
              ),
              countryMetadataIndex,
              adminLevel,
            } as DownloadTarget;
          }
        },
      );
    },
  );
}
