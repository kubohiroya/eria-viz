import { ReactNode } from "react";

export type SelectStorageBundlePanelProps = {
  children: ReactNode;
  label: string;
  onStorageBundleSelected: (storageBundleName: string) => void;
};
