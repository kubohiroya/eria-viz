import { type ReactNode, useContext, useEffect, useState } from "react";
import React from "react";

type StorageBundlesValue = {
  storageBundleNames: string[];
  setStorageBundleNames: (storageBundleNames: string[]) => void;
  storageBundleName: string;
  setStorageBundleName: (storageBundleName: string) => void;
};

const defaultStorageBundlesContextValue: StorageBundlesValue = {
  storageBundleNames: [],
  setStorageBundleNames: (storageBundleNames: string[]) => {},
  storageBundleName: "",
  setStorageBundleName: (storageBundleName: string) => {},
};

export const StorageBundlesContext = React.createContext<StorageBundlesValue>(
  defaultStorageBundlesContextValue,
);

export const StorageBundlesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [storageBundleNames, setStorageBundleNames] = useState<string[]>(
    defaultStorageBundlesContextValue.storageBundleNames,
  );
  const [storageBundleName, setStorageBundleName] = useState<string>(
    defaultStorageBundlesContextValue.storageBundleName,
  );

  return (
    <StorageBundlesContext.Provider
      value={{
        storageBundleNames,
        setStorageBundleNames,
        storageBundleName,
        setStorageBundleName,
      }}
    >
      {children}
    </StorageBundlesContext.Provider>
  );
};

export const useStorageBundlesContext = (): StorageBundlesValue => {
  return useContext(StorageBundlesContext);
};
