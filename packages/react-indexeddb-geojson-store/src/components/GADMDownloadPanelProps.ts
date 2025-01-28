import { CountryMetadata } from "../types/CountryMetadata";
import { DownloadStatus } from "../types/DownloadStatus";

export type GADMDownloadPanelProps = {
  databaseName: string;
  maxAdminLevel: number;
  downloadCountryMetadataArray: CountryMetadata[];
  downloadStatusMatrix: DownloadStatus[][];
};
