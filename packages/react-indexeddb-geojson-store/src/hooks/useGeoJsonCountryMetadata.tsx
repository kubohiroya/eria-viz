import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import React from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { GeoJSONMetadata, getGeoJSONDB } from "@eria-viz/indexeddb-geojson";
import { groupBy } from "../utils/arrayUtils";
import { useGeoJsonServiceContext } from "./useGeoJsonServiceContext";
import { GeoJsonService } from "../services/GeoJsonService";
import { download } from "@eria-viz/download";
import { SourceHosts } from "../types/SourceHosts";
import { useParams } from "react-router";

type GeoJsonCountryMetadataContextValue = {
  countryMetadataArray: CountryMetadata[];
  metadataArrayByCountryName: Map<string, GeoJSONMetadata[]>;
  maxAdminLevel: number;
};

const defaultGeoJsonCountryMetadataContext: GeoJsonCountryMetadataContextValue =
  {
    countryMetadataArray: [],
    metadataArrayByCountryName: new Map<string, GeoJSONMetadata[]>(),
    maxAdminLevel: 0,
  };

export const GeoJsonCountryMetadataContext =
  React.createContext<GeoJsonCountryMetadataContextValue>(
    defaultGeoJsonCountryMetadataContext,
  );

export const GeoJsonCountryMetadataContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  const {storageBundleName, sourceHostName} = useParams();

  const geoJsonService = useGeoJsonServiceContext();
  const [countryMetadataArray, setCountryMetadataArray] = useState<
    CountryMetadata[]
  >(defaultGeoJsonCountryMetadataContext.countryMetadataArray);
  const [metadataArrayByCountryName, setMetadataArrayByCountryName] = useState<
    Map<string, GeoJSONMetadata[]>
  >(defaultGeoJsonCountryMetadataContext.metadataArrayByCountryName);
  const [maxAdminLevel, setMaxAdminLevel] = useState<number>(
    defaultGeoJsonCountryMetadataContext.maxAdminLevel,
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
    if(!sourceHostName) {
      return;
    }

    console.log("indexedDBName", indexedDBName);
    console.log("sourceHostName", sourceHostName);

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
        setMaxAdminLevel(
          geoJsonService.geoJsonService?.catalog.properties.maxAdminLevel,
        );
        setCountryMetadataArray(
          geoJsonMetadataArray.map((geoJsonMetadata: GeoJSONMetadata) => {
            return {
              countryName: geoJsonMetadata.countryName,
              countryCode: geoJsonMetadata.countryCode,
              maxAdminLevel,
            };
          }),
        );
      });

    download(SourceHosts[sourceHostName].countryIndexPageUrl,
      {
        onFailed: (e) => {
          console.error(e);
        },
        onParseError: (e) => {
          console.error(e);
        },
        text: (content) => {
          createCountryMetadataArrayByContent(content).then((countryMetadataArray) => {
            setCountryMetadataArray(countryMetadataArray);
            setMaxAdminLevel(GeoJsonService.countMaxAdminLevel(countryMetadataArray));
          });
        }
      });
  }, [geoJsonService]);

  return (
    <GeoJsonCountryMetadataContext.Provider
      value={{
        countryMetadataArray,
        metadataArrayByCountryName,
        maxAdminLevel,
      }}
    >
      {children}
    </GeoJsonCountryMetadataContext.Provider>
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
    const [countryCode, countryName, maxAdminLevel] = option
      .getAttribute("value")!
      .split("_");
    countryMetadataArray.push({
      countryName,
      countryCode,
      maxAdminLevel: parseInt(maxAdminLevel),
    });
  }

  return countryMetadataArray;
};

export const useGeoJsonCountryMetadataContext = (): GeoJsonCountryMetadataContextValue => {
  return useContext(GeoJsonCountryMetadataContext);
};
