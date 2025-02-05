import { useParams } from "react-router";
import { useDialogContext } from "../hooks/useDialogContext";
import { useSourceHostsContext } from "../hooks/useSourceHostsContext";
import { useCallback, useEffect } from "react";
import {SourceHostNames, SourceHosts } from "../types/SourceHosts";
import { SourceHostsPanel } from "../components/SourceHosts/SourceHostsPanel";
import React from "react";

export default function(){
  const { sourceHostName: initialSourceHostName } = useParams();
  const dialogContext = useDialogContext();
  const sourceHostContext = useSourceHostsContext();

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
