import { useParams } from "react-router";
import { useDialogContext } from "../hooks/useDialogContext";
import { useCountryAdminsContext } from "../hooks/useCountryAdminsContext";
import { useCountryMetadataContext } from "../hooks/useCountryMetadata";
import { useEffect } from "react";
import {decodeBooleanArray, getRowLengths } from "../utils/arrayUtils";
import React from "react";

export default function()  {
  const { storageBundleName, sourceHostName, matrix } = useParams();
  const dialogContext = useDialogContext();

  const countryMetadataContext = useCountryMetadataContext();
  const countryAdminContext = useCountryAdminsContext();

  // const matrixArray = matrix && countryMetadataContext.countryMetadataArray && decodeBooleanArray(matrix, getRowLengths(countryAdminContext.selectCheckboxMatrix));

  useEffect(() => {
    dialogContext.setCompletedStepIndex(2);
    dialogContext.setCurrentStepIndex(3);
  }, []);

  if (storageBundleName === undefined || sourceHostName === undefined) {
    throw new Error("storageBundleName or sourceHostName is undefined");
  }
  return <></>;
};
