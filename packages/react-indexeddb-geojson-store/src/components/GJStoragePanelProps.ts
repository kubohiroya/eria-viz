import { ReactNode } from "react";

export type GJStoragePanelProps = {
  children: ReactNode;
  databaseName: string;
  databaseNames: string[];
  handleDatabaseNameChange: (name: string) => void;
};
