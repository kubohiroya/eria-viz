import {useCallback, useEffect } from "react";
import { decodeBooleanArray, getRowLengths } from "../utils/arrayUtils";
import React from "react";
import { CountryAdminsMatrixPanel } from "../components/CountryAdminsMatrix/CountryAdminsMatrixPanel";
import { SourceHosts } from "../types/SourceHosts";
import type {Route} from "./+types/countryAdmins";

export async function clientLoader({params}: Route.ClientLoaderArgs){
  console.log(params);
  return {
    storageBundleName: params.storageBundleName,
    sourceHostName: params.sourceHostName,
  }
}

export default function Layout(loaderData: Route.ComponentProps) {
  console.log(loaderData.params);
  const {
    storageBundleName,
    sourceHostName,
    dialogContext,
    countryMetadataContext,
    countryAdminContext,
    matrix,
  } = loaderData.params;

  /*
  useEffect(() => {
    dialogContext.setCompletedStepIndex(1);
    dialogContext.setCurrentStepIndex(2);
  }, []);
   */

  /*
  const hideFooter = useCallback(() => {
    dialogContext.setFooter(undefined);
  }, []);

  const showSelectedCountFooter = useCallback((count: number) => {
    if (count == 0) {
      // hideFooter();
      dialogContext.setNextButtonEnabled(false);
    } else {
      dialogContext.setFooter(`Selected shape files: ${count}`);
      dialogContext.setNextButtonEnabled(true);
    }
  }, []);

  const handleSelectCheckboxMatrixChange = useCallback(
    (matrix: boolean[][]) => {
      countryAdminContext.handleSelectCheckboxMatrix(matrix);
    },
    [],
  );

  const handleSelectedCountChange = useCallback((count: number) => {
    countryAdminContext.setSelectedCount(count);
    showSelectedCountFooter(count);
  }, []);

  const matrixArray = matrix && countryMetadataContext.countryMetadataArray && decodeBooleanArray(matrix, getRowLengths(countryAdminContext.selectCheckboxMatrix));

  const downloadedMatrix = Array<Array<boolean>>();
*/
  return `${storageBundleName}/${sourceHostName}`;



  /*
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
   */
};
