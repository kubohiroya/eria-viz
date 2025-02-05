import {Outlet, useNavigate } from "react-router";
import { useDialogContext } from "../hooks/useDialogContext";
import { useStorageBundlesContext } from "../hooks/useStorageBundlesContext";
import { useSourceHostsContext } from "../hooks/useSourceHostsContext";
import { useCountryAdminsContext } from "../hooks/useCountryAdminsContext";
import {useCallback, useRef } from "react";
import {APP_NAME, BASE } from "../config";
import { GeoJsonService } from "../services/GeoJsonService";
import {Card, CardActionArea, CardContent, Dialog, DialogContent } from "@mui/material";
import { GJDialogTitle } from "../components/GJDialogTitle";
import { encodeBooleanArray } from "../utils/arrayUtils";
import React from "react";
import { GJDialogStepTitle } from "../components/GJDialogStepTitle";
import { GJDialogActions } from "../components/GJDialogActions";

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

export default function DialogLuncherPage()  {
  const navigate = useNavigate();
  const dialogContext = useDialogContext();
  const storageBundleContext = useStorageBundlesContext();
  const sourceHostContext = useSourceHostsContext();
  const countryAdminContext = useCountryAdminsContext();

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const focusNextButton = useCallback(() => {
    setTimeout(() => {
      nextButtonRef.current?.focus();
    });
  }, []);

  const urls = [
    `/${BASE}/${APP_NAME}/`,
    `/${BASE}/${APP_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}`,
    `/${BASE}/${APP_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}/${encodeURIComponent(sourceHostContext.sourceHostName)}`,
    `/${BASE}/${APP_NAME}/${encodeURIComponent(storageBundleContext.storageBundleName)}/${encodeURIComponent(sourceHostContext.sourceHostName)}/${encodeBooleanArray(countryAdminContext.selectCheckboxMatrix).encoded}`,
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
