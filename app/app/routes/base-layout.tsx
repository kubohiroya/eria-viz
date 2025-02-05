import React from "react"
import { DialogContextProvider } from "../hooks/useDialogContext"
import { StorageBundlesContextProvider } from "../hooks/useStorageBundlesContext";
import { GeoJsonServiceContextProvider } from "../hooks/useGeoJsonServiceContext";
import { SourceHostsContextProvider } from "../hooks/useSourceHostsContext";
import { CountryMetadataContextProvider } from "../hooks/useCountryMetadata";
import { CountryAdminsContextProvider } from "../hooks/useCountryAdminsContext";

import { Outlet } from "react-router";

export const BaseLayout = ()=>{
  return (
    <DialogContextProvider>
      <StorageBundlesContextProvider>
        <GeoJsonServiceContextProvider>
          <SourceHostsContextProvider>
            <CountryMetadataContextProvider>
              <CountryAdminsContextProvider>

                  <Outlet />

              </CountryAdminsContextProvider>
            </CountryMetadataContextProvider>
          </SourceHostsContextProvider>
        </GeoJsonServiceContextProvider>
      </StorageBundlesContextProvider>
    </DialogContextProvider>
  )
}
export default BaseLayout;