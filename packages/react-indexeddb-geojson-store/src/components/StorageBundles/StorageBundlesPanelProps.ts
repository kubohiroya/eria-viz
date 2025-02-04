import { ReactNode } from "react";

export type StorageBundlesPanelProps = {
  children: ReactNode;
  label: string;
  onStorageBundleSelected: (storageBundleName: string) => void;
};
