import { CountryMetadata } from "../../types/CountryMetadata";
import { DownloadStatus } from "../../types/DownloadStatus";

export type DownloadShapesMatrixPanelProps = {
  databaseName: string;
  maxAdminLevel: number;
  downloadCountryMetadataArray: CountryMetadata[];
  downloadStatusMatrix: DownloadStatus[][];
};
