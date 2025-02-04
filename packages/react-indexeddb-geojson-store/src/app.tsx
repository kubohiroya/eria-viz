import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
  useParams,
} from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { StorageBundlesPanel } from "./components/StorageBundles/StorageBundlesPanel";
import { GJDialogTitle } from "./components/GJDialogTitle";
import { GJDialogStepTitle } from "./components/GJDialogStepTitle";
import { GJDialogActions } from "./components/GJDialogActions";
import {
  DialogContextProvider,
  useDialogContext,
} from "./hooks/useDialogContext";
import {
  SourceHostContextProvider,
  useSourceHostContext,
} from "./hooks/useSourceHostContext";
import { SourceHostsPanel } from "./components/SourceHosts/SourceHostsPanel";
import { SourceHostNames, SourceHosts } from "./types/SourceHosts";
import {
  StorageBundleContextProvider,
  useStorageBundleContext,
} from "./hooks/useStorageBundleContext";
import {
  GeoJsonServiceContextProvider,
  useGeoJsonServiceContext,
} from "./hooks/useGeoJsonServiceContext";
import {
  GeoJsonCountryMetadataContextProvider,
  useGeoJsonCountryMetadataContext,
} from "./hooks/useGeoJsonCountryMetadata";
import { GeoJsonService } from "./services/GeoJsonService";
import { CountryAdminsMatrixPanel } from "./components/CountryAdminsMatrix/CountryAdminsMatrixPanel";
import {
  CountryAdminContextProvider,
  useCountryAdminContext,
} from "./hooks/useCountryAdminContext";

const BASE = "react-indexeddb-geojson-store";
const DIALOG_NAME = "geojson-store";

const Layout = () => {
  return (
    <Box>
      <Typography variant={"h3"}>Shapre File Select Downloader</Typography>
      <Outlet />
    </Box>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const openDialog = useCallback(() => {
    navigate(`/${BASE}/${DIALOG_NAME}`);
  }, []);

  return (
    <Box>
      <Button variant="contained" onClick={openDialog}>
        Open Dialog
      </Button>
    </Box>
  );
};

const dialogTitleLabels: string[] = [
  "Storage",
  "Source Host",
  "Country / Admin",
  "Download",
];

const dialogTitleDescriptions: string[] = [
  "Enter new storage name or select one of the storage names to store shape files",
  "Select one of the sources hosting shape files",
  "Select countries and admin levels to download its shape files",
  "Download selected shape files",
];

const DialogLuncherPage = () => {
  const navigate = useNavigate();
  const dialogContext = useDialogContext();
  const storageBundleContext = useStorageBundleContext();
  const sourceHostContext = useSourceHostContext();

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const focusNextButton = useCallback(() => {
    setTimeout(() => {
      nextButtonRef.current?.focus();
    });
  }, []);

  const urls = [
    `/${BASE}/${DIALOG_NAME}/`,
    `/${BASE}/${DIALOG_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}`,
    `/${BASE}/${DIALOG_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}/s/${encodeURIComponent(sourceHostContext.sourceHostName)}`,
    `/${BASE}/${DIALOG_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}/s/${encodeURIComponent(sourceHostContext.sourceHostName)}/download`,
  ];

  const closeDialog = useCallback(() => {
    navigate(`/${BASE}`);
  }, []);

  const handleNext = useCallback(() => {
    const currentStepIndex = dialogContext.currentStepIndex;
    if (
      currentStepIndex === 0 ||
      currentStepIndex === 1 ||
      currentStepIndex === 2 ||
      currentStepIndex === 3
    ) {
      const next = () => {
        const nextStepIndex = currentStepIndex + 1;
        dialogContext.setCurrentStepIndex(nextStepIndex);
        dialogContext.setCompletedStepIndex(currentStepIndex);
        navigate(urls[nextStepIndex]);
      };
      if (
        currentStepIndex === 0 &&
        storageBundleContext.storageBundleName.length > 0 &&
        !storageBundleContext.storageBundleNames.includes(
          storageBundleContext.storageBundleName,
        )
      ) {
        GeoJsonService.createInstance(
          storageBundleContext.storageBundleName,
        ).then((geoJsonService: GeoJsonService) => {
          next();
        });
      } else {
        next();
      }
    } else if (currentStepIndex == 4) {
      console.log("FINISHED!");
      closeDialog();
    }
  }, [dialogContext.currentStepIndex, urls]);

  const handleBack = useCallback(() => {
    const currentStepIndex = dialogContext.currentStepIndex;
    if (currentStepIndex == 0) {
      closeDialog();
      return;
    } else if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      dialogContext.setCurrentStepIndex(prevStepIndex);
      navigate(urls[prevStepIndex]);
    }
  }, [dialogContext.currentStepIndex, urls]);

  return (
    <Dialog open={true} maxWidth="xl" fullWidth>
      <GJDialogTitle
        title="Shape File Select Downloader"
        currentStepIndex={dialogContext.currentStepIndex}
        completedStepIndex={dialogContext.completedStepIndex}
        labels={dialogTitleLabels}
      />
      <DialogContent>
        <Card>
          <CardContent>
            <GJDialogStepTitle
              label={dialogTitleLabels[dialogContext.currentStepIndex]}
              title={dialogTitleDescriptions[dialogContext.currentStepIndex]}
            />
            <Outlet />
          </CardContent>
          <CardActionArea></CardActionArea>
        </Card>
      </DialogContent>
      <GJDialogActions
        closeDialog={closeDialog}
        handleBack={handleBack}
        handleNext={handleNext}
        numSteps={dialogTitleLabels.length}
        nextButtonRef={nextButtonRef}
      />
    </Dialog>
  );
};

const StorageBundlesPage = () => {
  const { storageBundleName: initialStorageBundleName } = useParams();
  const dialogContext = useDialogContext();
  const storageBundleContext = useStorageBundleContext();
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

const SourceHostsPage = () => {
  const { sourceHostName: initialSourceHostName } = useParams();
  const dialogContext = useDialogContext();
  const sourceHostContext = useSourceHostContext();

  const handleSourceHostNameSelect = useCallback(
    (newSourceHostName: string) => {
      if (newSourceHostName !== "" && SourceHosts[newSourceHostName]) {
        sourceHostContext.setSourceHostName(newSourceHostName);
        dialogContext.setNextButtonEnabled(
          sourceHostContext.licenseAgreement[newSourceHostName],
        );
      } else {
        dialogContext.setNextButtonEnabled(false);
      }
    },
    [],
  );

  const handleAgreeLicense = useCallback((sourceHostName: string) => {
    dialogContext.setNextButtonEnabled(true);
    sourceHostContext.agreeLicense(sourceHostName);
  }, []);

  useEffect(() => {
    const newSourceHostName = initialSourceHostName
      ? initialSourceHostName
      : sourceHostContext.sourceHostName
        ? sourceHostContext.sourceHostName
        : SourceHostNames.GADM;
    handleSourceHostNameSelect(newSourceHostName);
    dialogContext.setNextButtonEnabled(
      sourceHostContext.licenseAgreement[sourceHostContext.sourceHostName],
    );
  }, [
    initialSourceHostName,
    sourceHostContext.sourceHostName,
    sourceHostContext.licenseAgreement,
  ]);

  useEffect(() => {
    dialogContext.setCompletedStepIndex(0);
    dialogContext.setCurrentStepIndex(1);
  }, []);

  return <SourceHostsPanel agreeLicense={handleAgreeLicense} />;
};

const CountryAdminsMatrixPage = () => {
  const { storageBundleName, sourceHostName } = useParams();
  const dialogContext = useDialogContext();
  const countryMetadataContext = useGeoJsonCountryMetadataContext();
  const countryAdminContext = useCountryAdminContext();

  useEffect(() => {
    dialogContext.setCompletedStepIndex(1);
    dialogContext.setCurrentStepIndex(2);
  }, []);

  const hideFooter = useCallback(() => {
    dialogContext.setFooter(undefined);
  }, []);

  const showSelectedCountFooter = useCallback((count: number) => {
    if (count == 0) {
      hideFooter();
      dialogContext.setNextButtonEnabled(false);
    } else {
      dialogContext.setFooter(`Selected shape files: ${count}`);
      dialogContext.setNextButtonEnabled(true);
    }
  }, []);

  const handleSelectCheckboxMatrixChange = useCallback(
    (matrix: boolean[][]) => {
      countryAdminContext.setSelectCheckboxMatrix(matrix);
    },
    [],
  );

  const handleSelectedCountChange = useCallback((count: number) => {
    countryAdminContext.setSelectedCount(count);
    showSelectedCountFooter(count);
  }, []);

  if (
    storageBundleName === undefined ||
    sourceHostName === undefined ||
    countryMetadataContext.countryMetadataArray.length === 0
  ) {
    return "";
  }

  const downloadedMatrix = Array<Array<boolean>>();

  return (
    <CountryAdminsMatrixPanel
      countryMetadataArray={countryMetadataContext.countryMetadataArray}
      numAdminLevels={countryMetadataContext.numAdminLevels}
      countryIndexPageUrl={SourceHosts[sourceHostName].countryIndexPageUrl}
      downloadedMatrix={downloadedMatrix}
      handleCheckedCountChange={handleSelectedCountChange}
      handleCheckboxMatrixChange={handleSelectCheckboxMatrixChange}
    />
  );
};

const DownloadShapesMatrixPage = () => {
  const { storageBundleName, sourceHostName } = useParams();
  const dialogContext = useDialogContext();

  useEffect(() => {
    dialogContext.setCompletedStepIndex(2);
    dialogContext.setCurrentStepIndex(3);
  }, []);

  if (storageBundleName === undefined || sourceHostName === undefined) {
    throw new Error("storageBundleName or sourceHostName is undefined");
  }
  return <></>;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/${BASE}`} element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="geojson-store"
            element={
              <DialogContextProvider>
                <StorageBundleContextProvider>
                  <GeoJsonServiceContextProvider>
                    <DialogLuncherPage />
                  </GeoJsonServiceContextProvider>
                </StorageBundleContextProvider>
              </DialogContextProvider>
            }
          >
            <Route index element={<StorageBundlesPage />} />
            <Route
              path=":storageBundleName"
              element={
                <SourceHostContextProvider>
                  <Outlet />
                </SourceHostContextProvider>
              }
            >
              <Route index element={<SourceHostsPage />} />
              <Route
                path="s/:sourceHostName"
                element={
                  <GeoJsonCountryMetadataContextProvider>
                    <CountryAdminContextProvider>
                      <Outlet />
                    </CountryAdminContextProvider>
                  </GeoJsonCountryMetadataContextProvider>
                }
              >
                <Route index element={<CountryAdminsMatrixPage />} />
                <Route path="download" element={<DownloadShapesMatrixPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
