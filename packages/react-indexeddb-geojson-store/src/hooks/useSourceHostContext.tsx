import React, { ReactNode, useCallback, useContext, useEffect } from "react";
import { useState } from "react";
import { SourceHostNames } from "../types/SourceHosts";
import { useGeoJsonServiceContext } from "./useGeoJsonServiceContext";
import { useStorageBundleContext } from "./useStorageBundleContext";
import { useParams } from "react-router";

type SourceHostContextValue = {
  sourceHostName: string;
  setSourceHostName: (sourceHostName: string) => void;
  licenseAgreement: { [key: string]: boolean };
  agreeLicense: (sourceName: string) => void;
};

const defaultSourceHostContextValue: SourceHostContextValue = {
  sourceHostName: SourceHostNames.GADM,
  setSourceHostName: (sourceName: string) => {},
  licenseAgreement: {} as { [key: string]: boolean },
  agreeLicense: (sourceName: string) => {},
};

export const SourceHostContext = React.createContext<SourceHostContextValue>(
  defaultSourceHostContextValue,
);

export const SourceHostContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { storageBundleName: storageBundleNameFromParam } = useParams();
  const storageBundleContext = useStorageBundleContext();
  const geoJsonServiceContext = useGeoJsonServiceContext();

  const [sourceHostName, setSourceHostName] = useState<string>(
    defaultSourceHostContextValue.sourceHostName,
  );
  const [licenseAgreement, setLicenseAgreement] = useState<{
    [key: string]: boolean;
  }>(defaultSourceHostContextValue.licenseAgreement);

  useEffect(() => {
    if (storageBundleNameFromParam) {
      storageBundleContext.setStorageBundleName(storageBundleNameFromParam);
    }
  }, [storageBundleNameFromParam]);

  useEffect(() => {
    const properties = geoJsonServiceContext.geoJsonService?.catalog.properties;
    if (properties) {
      if (properties.sourceHostName) {
        setSourceHostName(properties.sourceHostName);
      }
      setLicenseAgreement(properties.licenseAgreement || {});
    }
  }, [geoJsonServiceContext.geoJsonService]);

  const agreeLicense = useCallback(
    (sourceHostName: string) => {
      if (geoJsonServiceContext.geoJsonService?.catalog) {
        const newLicenseAgreement =
          geoJsonServiceContext.geoJsonService?.catalog.properties
            .licenseAgreement || {};
        newLicenseAgreement[sourceHostName] = true;
        setLicenseAgreement(newLicenseAgreement);
        geoJsonServiceContext.geoJsonService?.catalog.update({
          properties: { licenseAgreement: newLicenseAgreement },
        });
      }
    },
    [geoJsonServiceContext],
  );

  return (
    <SourceHostContext.Provider
      value={{
        sourceHostName,
        setSourceHostName,
        licenseAgreement,
        agreeLicense,
      }}
    >
      {children}
    </SourceHostContext.Provider>
  );
};

export const useSourceHostContext = (): SourceHostContextValue => {
  return useContext(SourceHostContext);
};
