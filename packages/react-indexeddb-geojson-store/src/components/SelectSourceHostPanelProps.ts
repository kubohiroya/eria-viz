import { SourceHostMetadata } from "../types/SourceHosts";

export type SelectSourceHostPanelProps = {
  licenseAgreement?: {[key:string]: boolean};
  agreeLicense: (sourceHostName: string) => void;
};
