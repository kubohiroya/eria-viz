export type SourceMetadata = {
  sourcePageUrl: string;
  sourceName: string;
  sourceDescription: string;
  licensePageUrl: string;
};

export type GADMSourcePanelProps = {
  selectedSourceName: string | undefined;
  setSelectedSourceName: (sourceName: string) => void;
  sourceNameArray: string[];
  sources: Map<string, SourceMetadata>;
  licenseAgreement: Map<string, boolean>;
  agreeLicense: (sourceName: string) => void;
};
