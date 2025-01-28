import React, {ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { memo } from "react";
import {
  Dialog,
  Typography,
  DialogContent,
  Box,
  Card,
  CardContent,
  CardActionArea,
  DialogActions,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { GADMStoragePanel } from "./GADMStoragePanel";
import { GADMSourcePanel } from "./GADMSourcePanel";
import { CountryMetadata } from "../types/CountryMetadata";
import { GADMSelectPanel } from "./GADMSelectPanel";
import { GADMDownloadPanel } from "./GADMDownloadPanel";
import { GADMService } from "../services/GADMService";
import { DatabaseCatalog } from "@eria-viz/indexeddb-catalog";
import { DownloadStatus } from "../types/DownloadStatus";
import { GADMDialogTitle } from "./GADMDialogTitle";
import { download } from "@eria-viz/download";

export type GADMSelectDialogProps = {
  setShowDialog: (show: boolean) => void;
  initialize: true;
};

enum SourceNames {
  GADM = "GADM",
}
const sourceNameArray = [SourceNames.GADM];

const sources = new Map<
  string,
  {
    sourceName: string;
    sourcePageUrl: string;
    sourceDescription: string;
    licensePageUrl: string;
    countryIndexPageUrl: string;
  }
>([
  [
    "GADM",
    {
      sourceName: SourceNames.GADM,
      sourcePageUrl: "https://gadm.org",
      sourceDescription: `GADM is a spatial database of the location of the world's administrative areas (or adminstrative boundaries) for use in GIS and similar software. Administrative areas in this database are countries and lower level subdivisions such as provinces, departments, bibhag, bundeslander, daerah istimewa, fivondronana, krong, landsvæðun, opština, sous-préfectures, counties, and thana. GADM describes where these administrative areas are (the "spatial features"), and for each area it provides some attributes, such as the name and variant names.`,
      licensePageUrl: "https://gadm.org/license.html",
      countryIndexPageUrl: "https://gadm.org/download_country.html",
    },
  ],
]);

export const GADMSelectDialogCore = ({
  setShowDialog,
}: GADMSelectDialogProps) => {
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const hideDialog = useCallback(() => setShowDialog(false), [setShowDialog]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0); //FIXME
  const [completedStepIndex, setCompletedStepIndex] = useState<number>(0);
  const [allStepsCompleted, setAllStepsCompleted] = useState<boolean>(false);

  const [footer, setFooter] = useState<ReactNode>(null);

  const handleNext = useCallback(() => {
    if (
      currentStepIndex === 0 ||
      currentStepIndex === 1 ||
      currentStepIndex === 2 ||
      currentStepIndex === 3
    ) {
      setCompletedStepIndex(currentStepIndex);
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      steps[nextStepIndex].onEnter?.();
    } else if (currentStepIndex == 4) {
      setAllStepsCompleted(true);
      handleFinished();
    }
  }, [currentStepIndex]);

  const handleFinished = useCallback(() => {
    // FIXME !!!!!!
    console.log("FINISHED!");
    hideDialog();
  }, []);

  const handleBack = useCallback(() => {
    if (currentStepIndex == 0) {
      hideDialog();
      return;
    }
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIndex);
      steps[prevStepIndex].onEnter?.();
    }
  }, [currentStepIndex]);

  const databaseCatalogRoot = useRef<DatabaseCatalog>(undefined);
  const databaseCatalog = useRef<DatabaseCatalog>(undefined);
  const gadmService = useRef<GADMService>(undefined);

  const [databaseNames, setDatabaseNames] = useState<Array<string>>([]);
  const [databaseName, setDatabaseName] = useState<string>("");
  const [downloadedMatrix, setDownloadedMatrix] = useState<boolean[][]>(
      [],
  );

  const focusNextButton = useCallback(() => {
    setTimeout(() => {
      nextButtonRef.current?.focus();
    });
  }, []);

  const initializeStoragePanel = useCallback(async function () {
    const catalogRoot = await GADMService.getCatalogRoot();
    if (!catalogRoot) {
      throw new Error("catalogRoot is not found");
    }
    databaseCatalogRoot.current = catalogRoot;
    const currentDatabaseName =
      databaseCatalogRoot.current.properties.defaultDatabaseName || "";

    if (currentDatabaseName !== "") {
      setDatabaseName(currentDatabaseName);
    }
    const catalog: DatabaseCatalog | null =
      await databaseCatalogRoot.current.get(currentDatabaseName);
    if (currentDatabaseName !== "" && catalog !== null) {
      databaseCatalog.current = catalog;
      gadmService.current = await GADMService.createInstance(catalog.name);
    }
    setDatabaseNames(await GADMService.listDatabaseNames());
  }, []);

  useEffect(() => {
    initializeStoragePanel();
  }, []);

  const handleAgreeLicense = useCallback((sourceName: string) => {
    licenseAgreement.set(sourceName, true);
    setLicenseAgreement(licenseAgreement);
    focusNextButton();
  }, []);

  const initializeSelectPanel = useCallback(async (content: string) => {
    if (gadmService.current === undefined) {
      throw new Error("gadmService is not initialized");
    }

    const countryMetadataArray =
      await gadmService.current.updateCountryMetadataArray(content);

    setMaxAdminLevel(GADMService.countMaxAdminLevel(countryMetadataArray));
    setCountryMetadataArray(countryMetadataArray);
    const downloadedMatrix = await gadmService.current.createDownloadedMatrix()
    setDownloadedMatrix(downloadedMatrix);
    setSelectCheckboxMatrix(structuredClone(downloadedMatrix));
  }, []);

  const handleDatabaseNameChange = useCallback(async (databaseName: string) => {
    if (databaseName === "") {
      throw new Error("databaseName is empty");
    }
    if (!databaseCatalogRoot.current) {
      throw new Error("catalogRoot is not found");
    }
    databaseCatalogRoot.current.update({
      properties: { defaultDatabaseName: databaseName },
    });
    databaseCatalog.current =
      (await databaseCatalogRoot.current?.get(databaseName)) ||
      (await databaseCatalogRoot.current?.create(databaseName, "", {}));
    gadmService.current = await GADMService.createInstance(
      databaseCatalog.current.name
    );
    setDatabaseName(databaseName);
    if (!databaseNames.includes(databaseName)) {
      setDatabaseNames([...databaseNames, databaseName]);
    }

    focusNextButton();
  }, []);

  const [selectedSourceName, setSelectedSourceName] = useState<string>(
    SourceNames.GADM,
  );
  const [licenseAgreement, setLicenseAgreement] = useState<
    Map<string, boolean>
  >(new Map<string, boolean>());
  const [maxAdminLevel, setMaxAdminLevel] = useState<number>(3);
  const [countryIndexPageUrl, setCountryIndexPageUrl] = useState<string>(
    sources.get(SourceNames.GADM)!.countryIndexPageUrl,
  );
  const [countryMetadataArray, setCountryMetadataArray] = useState<
    Array<CountryMetadata>
  >([]);

  const [selectCheckboxMatrix, setSelectCheckboxMatrix] = useState<boolean[][]>(
      [],
  );

  const [selectedCount, setSelectedCount] = useState<number>(0);

  const [downloadCountryMetadataArray, setDownloadCountryMetadataArray] =
    useState<CountryMetadata[]>([]);
  const [downloadStatusMatrix, setDownloadStatusMatrix] = useState<
    DownloadStatus[][]
  >([]);

  const handleCountryIndexPageUrlUpdate = useCallback(
    (indexPageUrl: string) => {
      download(
        indexPageUrl,
          {
            onFailed: (message) => {
              console.error(indexPageUrl, message);
            },
            text: (content) => {
              initializeSelectPanel(content);
            }
          }
      );
    },
    [],
  );

  const handleSelectCheckboxMatrixChange = useCallback(
    (matrix: boolean[][]) => {
      setSelectCheckboxMatrix(matrix);
    },
    [],
  );

  const hideFooter = useCallback(() => {
    setFooter(undefined);
  }, []);

  const showSelectedCount = useCallback((count: number) => {
    if(count == 0) {
      hideFooter();
    }else{
      setFooter(`Selected shape count: ${count}`);
    }
  }, []);

  const handleSelectedCountChange = useCallback((count: number) => {
    setSelectedCount(count);
    showSelectedCount(count);
  }, []);

  const initializeDownloadPanel = useCallback(
    (
      countryMetadataArray: CountryMetadata[],
      selectCheckboxMatrix: boolean[][],
    ) => {
      if (!gadmService.current) {
        return;
      }
      const downloadCountryMetadataArray = countryMetadataArray.filter(
        (_: CountryMetadata, rowIndex: number) => {
          return selectCheckboxMatrix[rowIndex].some(
            (checked: boolean) => checked,
          );
        },
      );
      setDownloadCountryMetadataArray(downloadCountryMetadataArray);
      console.log('initializeDownloadPanel', countryMetadataArray, selectCheckboxMatrix, downloadCountryMetadataArray);

      const downloadStatusMatrix = selectCheckboxMatrix
        .map((row: Array<boolean | undefined>, rowIndex: number) => {
          return row.map((checked: boolean | undefined, columnIndex: number) =>
            checked ? DownloadStatus.Initialized : DownloadStatus.NonTarget,
          );
        })
        .filter((row: Array<DownloadStatus>) => {
          return row.some(
            (status: DownloadStatus) => status === DownloadStatus.Initialized,
          );
        });
      setDownloadStatusMatrix(downloadStatusMatrix);
    },
    [],
  );

  const steps = [
    {
      label: "Storage",
      title: "Select one of the storages to store shape files",
      onEnter: () => {
        hideFooter();
      },
      contents: (
        <GADMStoragePanel
          databaseNames={databaseNames}
          databaseName={databaseName}
          handleDatabaseNameChange={handleDatabaseNameChange}
        >
          <Alert severity="info">
            Please enter new storage name or select one of the preexisting
            storages to store shape files:
          </Alert>
        </GADMStoragePanel>
      ),
      isNextButtonEnabled: () => databaseName !== "",
    },
    {
      label: "Source",
      title: "Select one of the sources hosting shape files",
      onEnter: () => {
        initializeStoragePanel();
        hideFooter();
      },
      contents: (
        <GADMSourcePanel
          selectedSourceName={selectedSourceName}
          setSelectedSourceName={setSelectedSourceName}
          sources={sources}
          sourceNameArray={sourceNameArray}
          licenseAgreement={licenseAgreement}
          agreeLicense={handleAgreeLicense}
        />
      ),
      isNextButtonEnabled: () => licenseAgreement,
    },
    {
      label: "Shape Files",
      title: "Select Countries and Admin Levels to download its shape files",
      onEnter: () => {
        handleCountryIndexPageUrlUpdate(countryIndexPageUrl);
        showSelectedCount(selectedCount);
      },
      contents: (
        <GADMSelectPanel
          countryIndexPageUrl={countryIndexPageUrl}
          handleCountryIndexPageUrlChange={handleCountryIndexPageUrlUpdate}
          maxAdminLevel={maxAdminLevel}
          downloadedMatrix={downloadedMatrix}
          checkboxMatrix={selectCheckboxMatrix}
          countryMetadataArray={countryMetadataArray}
          handleCheckedCountChange={handleSelectedCountChange}
          handleCheckboxMatrixChange={handleSelectCheckboxMatrixChange}
        />
      ),
      isNextButtonEnabled: () => selectedCount > 0,
    },
    {
      label: "Download",
      title: "Download selected shape files",
      onEnter: useCallback(() => {
        initializeDownloadPanel(countryMetadataArray, selectCheckboxMatrix);

        // Comlinkでダウンロードを開始
        // 修了したらAlartを表示
      }, [countryMetadataArray, selectCheckboxMatrix]),
      contents: (
        <GADMDownloadPanel
          databaseName={databaseName}
          maxAdminLevel={maxAdminLevel}
          downloadCountryMetadataArray={downloadCountryMetadataArray}
          downloadStatusMatrix={downloadStatusMatrix}
        />
      ),
      isNextButtonEnabled: () => true,
    },
  ];

  return (
    <Dialog open={true} maxWidth="xl" fullWidth>
      <GADMDialogTitle
        title="Shape File Downloader"
        currentStepIndex={currentStepIndex}
        completedStepIndex={completedStepIndex}
        labels={steps.map((step) => step.label)}
      />
      <DialogContent>
        <Box>
          {allStepsCompleted ? (
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
          ) : (
            <Card>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontStyle: "bold",
                    marginBottom: "16px",
                  }}
                >
                  {steps[currentStepIndex]?.label +
                    " : " +
                    steps[currentStepIndex]?.title}
                </Typography>

                {steps[currentStepIndex]?.contents}
              </CardContent>
              <CardActionArea></CardActionArea>
            </Card>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ margin: "10px" }}>
        <IconButton
          size="large"
          sx={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
          }}
          onClick={hideDialog}
        >
          <Close style={{ width: "40px", height: "40px" }} />
        </IconButton>
        <Button
          size="large"
          style={{ padding: "16px 48px 16px 48px" }}
          variant={"contained"}
          color="inherit"
          onClick={handleBack}
        >
          {currentStepIndex === 0 ? "Cancel" : "Back"}
        </Button>
        <Box sx={{ flex: "1 1 auto"}}>
          <Typography textAlign={"right"}>{footer}</Typography>
        </Box>
        <Button
          size="large"
          style={{ padding: "16px 48px 16px 48px" }}
          variant={"contained"}
          disabled={!steps[currentStepIndex].isNextButtonEnabled()}
          title={
            currentStepIndex < steps.length - 1
              ? `Step ${currentStepIndex + 1}`
              : "Finish"
          }
          onClick={handleNext}
          ref={nextButtonRef}
        >
          {currentStepIndex < steps.length - 1 ? "Next" : "Finish"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const GADMDialog = memo(GADMSelectDialogCore);
