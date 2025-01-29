import React, {memo, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {Alert, Box, Card, CardActionArea, CardContent, Dialog, DialogContent, Typography,} from "@mui/material";
import {GJStoragePanel} from "./GJStoragePanel";
import {GJSourcePanel} from "./GJSourcePanel";
import {CountryMetadata} from "../types/CountryMetadata";
import {GJSelectPanel} from "./GJSelectPanel";
import {GJDownloadPanel} from "./GJDownloadPanel";
import {GADMService} from "../services/GADMService";
import {DatabaseCatalog} from "@eria-viz/indexeddb-catalog";
import {DownloadStatus} from "../types/DownloadStatus";
import {GJDialogTitle} from "./GJDialogTitle";
import {download} from "@eria-viz/download";
import {GJDialogActions} from "./GJDialogActions";
import {GJDialogStepTitle} from "./GJDialogStepTitle";
import { GJDialogProps } from "./GJDialogProps";
import { ShapeFileSourceNames, ShapeFileSources, ShapreFileSourceNameArray } from "./ShapeFileSources";


export const GJDialogCore = ({
  setShowDialog,
}: GJDialogProps) => {
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
  const [downloadedMatrix, setDownloadedMatrix] = useState<boolean[][]>([]);

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
    const newLicenseAgreement = {...licenseAgreement};
    newLicenseAgreement[sourceName] = true;
    setLicenseAgreement(newLicenseAgreement);
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
      ShapeFileSourceNames.GADM,
  );
  const [licenseAgreement, setLicenseAgreement] = useState<{[key:string]: boolean}>({});
  const [maxAdminLevel, setMaxAdminLevel] = useState<number>(3);
  const [countryIndexPageUrl, setCountryIndexPageUrl] = useState<string>(
    ShapeFileSources.get(ShapeFileSourceNames.GADM)!.countryIndexPageUrl,
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
      setCountryIndexPageUrl(indexPageUrl);
      download(
        indexPageUrl,
          {
            onFailed: (message: string) => {
              console.error(indexPageUrl, message);
            },
            text: (content: string) => {
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
      setFooter(`Selected shape files: ${count}`);
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
        <GJStoragePanel
          databaseNames={databaseNames}
          databaseName={databaseName}
          handleDatabaseNameChange={handleDatabaseNameChange}
        >
          <Alert severity="info">
            Please enter new storage name or select one of the preexisting
            storages to store shape files:
          </Alert>
        </GJStoragePanel>
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
        <GJSourcePanel
          selectedSourceName={selectedSourceName}
          setSelectedSourceName={setSelectedSourceName}
          sources={ShapeFileSources}
          sourceNameArray={ShapreFileSourceNameArray}
          licenseAgreement={licenseAgreement}
          agreeLicense={handleAgreeLicense}
        />
      ),
      isNextButtonEnabled: () => licenseAgreement[selectedSourceName] ?? false,
    },
    {
      label: "Countries/Admin Levels",
      title: "Select countries and admin levels to download its shape files",
      onEnter: () => {
        handleCountryIndexPageUrlUpdate(countryIndexPageUrl);
        showSelectedCount(selectedCount);
      },
      contents: (
        <GJSelectPanel
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
        <GJDownloadPanel
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
      <GJDialogTitle
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
                <GJDialogStepTitle
                    label={steps[currentStepIndex]?.label}
                    title={steps[currentStepIndex]?.title}
                />
                {steps[currentStepIndex]?.contents}
              </CardContent>
              <CardActionArea></CardActionArea>
            </Card>
          )}
        </Box>
      </DialogContent>
      <GJDialogActions
        hideDialog={hideDialog}
        handleBack={handleBack}
        handleNext={handleNext}
        currentStepIndex={currentStepIndex}
        numSteps={steps.length}
        isNextButtonEnabled={steps[currentStepIndex]?.isNextButtonEnabled()}
        footer={footer}
        nextButtonRef={nextButtonRef}
      />
    </Dialog>
  );
};

export const GJDialog = memo(GJDialogCore);
