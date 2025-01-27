import { DownloadStatus } from "../types/DownloadStatus";

export type GADMSelectStep4States = {
    progress: Map<string, number>;
    downloadItemStatus: Map<string, DownloadStatus>;
    status: DownloadStatus;
};