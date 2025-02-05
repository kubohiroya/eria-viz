import { useParams } from "react-router";
import { useDialogContext } from "../hooks/useDialogContext";
import { useStorageBundlesContext } from "../hooks/useStorageBundlesContext";
import { useGeoJsonServiceContext } from "../hooks/useGeoJsonServiceContext";
import { useCallback, useEffect } from "react";
import { GeoJsonService } from "../services/GeoJsonService";
import { StorageBundlesPanel } from "../components/StorageBundles/StorageBundlesPanel";
import React from "react";
import { Alert } from "@mui/material";

export default function() {
  const { storageBundleName: initialStorageBundleName } = useParams();
  const dialogContext = useDialogContext();
  const storageBundleContext = useStorageBundlesContext();
  const geojsonServiceContext = useGeoJsonServiceContext();

  if (initialStorageBundleName && initialStorageBundleName !== "") {
    storageBundleContext.setStorageBundleName(initialStorageBundleName);
  }

  const onStorageBundleSelected = useCallback(
    (storageBundleName: string) => {
      if (storageBundleName !== "") {
        dialogContext.setNextButtonEnabled(true);
        geojsonServiceContext.geoJsonService?.setDefaultDatabaseName(
          storageBundleName,
        );
      } else {
        dialogContext.setNextButtonEnabled(false);
      }
    },
    [geojsonServiceContext],
  );

  useEffect(() => {
    dialogContext.setCompletedStepIndex(-1);
    dialogContext.setCurrentStepIndex(0);
    (async (): Promise<void> => {
      storageBundleContext.setStorageBundleNames(
        await GeoJsonService.listDatabaseNames(),
      );
      const name = await GeoJsonService.getDefaultDatabaseName();
      if (name && name.length > 0) {
        dialogContext.setNextButtonEnabled(true);
        storageBundleContext.setStorageBundleName(name);
      } else {
        dialogContext.setNextButtonEnabled(false);
      }
    })();
  }, []);

  return (
    <StorageBundlesPanel
      label="Storage Bundle Name"
      onStorageBundleSelected={onStorageBundleSelected}
    >
      <Alert severity="info">
        Please enter new storage bundle name or select one of the preexisting
        storages to store shape files:
      </Alert>
    </StorageBundlesPanel>
  );
};
