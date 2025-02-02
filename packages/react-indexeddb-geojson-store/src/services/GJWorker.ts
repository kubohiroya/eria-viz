import { CountryMetadata } from "../types/CountryMetadata";
import { GeoJsonService } from "./GeoJsonService";

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
              url: GeoJsonService.createGeoJsonDownloadURL(
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
