import { CountryMetadata } from "../types/CountryMetadata";
import { DownloadStatus } from "../types/DownloadStatus";

export type GJDownloadPanelProps = {
  databaseName: string;
  maxAdminLevel: number;
  downloadCountryMetadataArray: CountryMetadata[];
  downloadStatusMatrix: DownloadStatus[][];
};
