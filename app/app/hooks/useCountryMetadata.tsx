import { type ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { type CountryMetadata } from "../types/CountryMetadata";
import { type GeoJSONMetadata, getGeoJSONDB } from "@eria-viz/indexeddb-geojson";
import { groupBy } from "../utils/arrayUtils";
import { useGeoJsonServiceContext } from "./useGeoJsonServiceContext";
import { GeoJsonService } from "../services/GeoJsonService";
import { download } from "@eria-viz/download";
import { SourceHosts } from "../types/SourceHosts";
import { useParams } from "react-router";

type CountryMetadataContextValue = {
  countryMetadataArray: CountryMetadata[];
  metadataArrayByCountryName: Map<string, GeoJSONMetadata[]>;
  numAdminLevels: number;
};

const defaultCountryMetadataContext: CountryMetadataContextValue =
  {
    countryMetadataArray: [],
    metadataArrayByCountryName: new Map<string, GeoJSONMetadata[]>(),
    numAdminLevels: 0,
  };

export const CountryMetadataContext =
  React.createContext<CountryMetadataContextValue>(
    defaultCountryMetadataContext,
  );

export const CountryMetadataContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { storageBundleName, sourceHostName } = useParams();

  const geoJsonService = useGeoJsonServiceContext();
  const [countryMetadataArray, setCountryMetadataArray] = useState<
    CountryMetadata[]
  >(defaultCountryMetadataContext.countryMetadataArray);
  const [metadataArrayByCountryName, setMetadataArrayByCountryName] = useState<
    Map<string, GeoJSONMetadata[]>
  >(defaultCountryMetadataContext.metadataArrayByCountryName);
  const [numAdminLevels, setNumAdminLevels] = useState<number>(
    defaultCountryMetadataContext.numAdminLevels,
  );

  useEffect(() => {
    if (geoJsonService === undefined) {
      return;
    }
    const indexedDBName =
      geoJsonService.geoJsonService?.catalog.getIndexedDBName();

    if (!indexedDBName) {
      return;
    }
    if (!sourceHostName) {
      return;
    }

    const geojsonDB = getGeoJSONDB(indexedDBName);
    geojsonDB.geojsonMetadata
      .toArray()
      .then((geoJsonMetadataArray: GeoJSONMetadata[]) => {
        if (!geoJsonService) {
          return;
        }
        setMetadataArrayByCountryName(
          groupBy({ source: geoJsonMetadataArray, key: "countryName" }),
        );
        setNumAdminLevels(
          geoJsonService.geoJsonService?.catalog.properties.numAdminLevels,
        );
        setCountryMetadataArray(
          geoJsonMetadataArray.map((geoJsonMetadata: GeoJSONMetadata) => {
            return {
              countryName: geoJsonMetadata.countryName,
              countryCode: geoJsonMetadata.countryCode,
              numAdminLevels,
            };
          }),
        );
      });

    download(SourceHosts[sourceHostName].countryIndexPageUrl, {
      onFailed: (e) => {
        console.error(e);
      },
      onParseError: (e) => {
        console.error(e);
      },
      text: (content) => {
        createCountryMetadataArrayByContent(content).then(
          (countryMetadataArray) => {
            setCountryMetadataArray(countryMetadataArray);
            setNumAdminLevels(
              GeoJsonService.countMaxAdminLevel(countryMetadataArray),
            );
          },
        );
      },
    });
  }, [geoJsonService]);

  return (
    <CountryMetadataContext.Provider
      value={{
        countryMetadataArray,
        metadataArrayByCountryName,
        numAdminLevels,
      }}
    >
      {children}
    </CountryMetadataContext.Provider>
  );
};

const createCountryMetadataArrayByContent = async (
  content: string,
): Promise<CountryMetadata[]> => {
  const doc = new DOMParser().parseFromString(content, "text/html");
  const select = doc.getElementById("countrySelect");
  if (select === null) {
    throw new Error();
  }
  const countryMetadataArray: CountryMetadata[] = [];
  for (let i = 0; i < select.children.length; i++) {
    const option = select.children.item(i);
    if (option === null) {
      continue;
    }
    const value = option.getAttribute("value");
    if (value === null || !value.includes("_")) {
      continue;
    }
    const [countryCode, countryName, numAdminLevels] = option
      .getAttribute("value")!
      .split("_");
    countryMetadataArray.push({
      countryName,
      countryCode,
      numAdminLevels: parseInt(numAdminLevels),
    });
  }

  return countryMetadataArray;
};

export const useCountryMetadataContext =
  (): CountryMetadataContextValue => {
    return useContext(CountryMetadataContext);
  };
