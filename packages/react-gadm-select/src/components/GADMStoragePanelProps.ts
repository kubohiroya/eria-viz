import { ReactNode } from "react";

export type GADMStoragePanelProps = {
  children: ReactNode;
  databaseName: string;
  databaseNames: string[];
  handleDatabaseNameChange: (name: string) => void;
};
