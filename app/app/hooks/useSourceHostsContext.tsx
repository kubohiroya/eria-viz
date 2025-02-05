import React, { type ReactNode, useCallback, useContext, useEffect } from "react";
import { useState } from "react";
import { SourceHostNames } from "../types/SourceHosts";
import { useGeoJsonServiceContext } from "./useGeoJsonServiceContext";
import { useStorageBundlesContext } from "./useStorageBundlesContext";
import { useParams } from "react-router";

type SourceHostsContextValue = {
  sourceHostName: string;
  setSourceHostName: (sourceHostName: string) => void;
  licenseAgreement: { [key: string]: boolean };
  agreeLicense: (sourceName: string) => void;
};

const defaultSourceHostsContextValue: SourceHostsContextValue = {
  sourceHostName: SourceHostNames.GADM,
  setSourceHostName: (sourceName: string) => {},
  licenseAgreement: {} as { [key: string]: boolean },
  agreeLicense: (sourceName: string) => {},
};

export const SourceHostsContext = React.createContext<SourceHostsContextValue>(
  defaultSourceHostsContextValue,
);

export const SourceHostsContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { storageBundleName: storageBundleNameFromParam } = useParams();
  const storageBundleContext = useStorageBundlesContext();
  const geoJsonServiceContext = useGeoJsonServiceContext();

  const [sourceHostName, setSourceHostName] = useState<string>(
    defaultSourceHostsContextValue.sourceHostName,
  );
  const [licenseAgreement, setLicenseAgreement] = useState<{
    [key: string]: boolean;
  }>(defaultSourceHostsContextValue.licenseAgreement);

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
    <SourceHostsContext.Provider
      value={{
        sourceHostName,
        setSourceHostName,
        licenseAgreement,
        agreeLicense,
      }}
    >
      {children}
    </SourceHostsContext.Provider>
  );
};

export const useSourceHostsContext = (): SourceHostsContextValue => {
  return useContext(SourceHostsContext);
};
