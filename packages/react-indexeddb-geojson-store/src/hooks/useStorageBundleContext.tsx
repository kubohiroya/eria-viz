import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";

type StorageBundleValue = {
  storageBundleNames: string[];
  setStorageBundleNames: (storageBundleNames: string[]) => void;
  storageBundleName: string;
  setStorageBundleName: (storageBundleName: string) => void;
};

const defaultStorageBundleContextValue: StorageBundleValue = {
  storageBundleNames: [],
  setStorageBundleNames: (storageBundleNames: string[]) => {},
  storageBundleName: "",
  setStorageBundleName: (storageBundleName: string) => {},
};

export const StorageBundleContext = React.createContext<StorageBundleValue>(
  defaultStorageBundleContextValue,
);

export const StorageBundleContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [storageBundleNames, setStorageBundleNames] = useState<string[]>(
    defaultStorageBundleContextValue.storageBundleNames,
  );
  const [storageBundleName, setStorageBundleName] = useState<string>(
    defaultStorageBundleContextValue.storageBundleName,
  );

  return (
    <StorageBundleContext.Provider
      value={{
        storageBundleNames,
        setStorageBundleNames,
        storageBundleName,
        setStorageBundleName,
      }}
    >
      {children}
    </StorageBundleContext.Provider>
  );
};

export const useStorageBundleContext = (): StorageBundleValue => {
  return useContext(StorageBundleContext);
};
