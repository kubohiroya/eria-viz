export type SourceHostsPanelProps = {
  licenseAgreement?: { [key: string]: boolean };
  agreeLicense: (sourceHostName: string) => void;
};
