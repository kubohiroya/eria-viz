import {atom} from 'jotai';
import { DownloadStatus } from '../types/DownloadStatus';

export type GJStoreNames = string[]
export const GJStoreNamesStateAtom = atom<GJStoreNames>([]);

export type GJDialogState = {
    currentStepIndex: number;
    completedStepIndex: number;
    allStepsCompleted: boolean;
    selectedDatabaseName: string;
    selectedSourceName: string;
}
export const GJDialogStateAtom = atom<GJDialogState>({
    currentStepIndex: 0,
    completedStepIndex: 0,
    allStepsCompleted: false,
    selectedDatabaseName: '',
    selectedSourceName: ''
});

export type GJStore = {
    databaseName: string
    sourceName: string
    updatedAt: number
}
export const GJStoreAtom = atom<GJStore>({
    databaseName: '',
    sourceName: '',
    updatedAt: 0
});

export type GJLicenseAgreementState = boolean;
export const GJLicenseAgreementStateAtom = atom<GJLicenseAgreementState>(false);

export type GJSelectingState = boolean[][];
export const GJSelectingStateAtom = atom<GJSelectingState>([]);

export type GJDownloadingStatus = DownloadStatus[][];
export const GJDownloadingStatusAtom = atom<GJDownloadingStatus>([]);
