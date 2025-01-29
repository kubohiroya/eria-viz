export type SourceMetadata = {
  sourcePageUrl: string;
  sourceName: string;
  sourceDescription: string;
  licensePageUrl: string;
};

export type GJSourcePanelProps = {
  selectedSourceName: string | undefined;
  setSelectedSourceName: (sourceName: string) => void;
  sourceNameArray: string[];
  sources: Map<string, SourceMetadata>;
  licenseAgreement: {[key:string]: boolean};
  agreeLicense: (sourceName: string) => void;
};
