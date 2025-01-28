import {
  Box,
  styled,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { produce } from "immer";
import { GADMSelectHeaderPanel } from "./GADMSelectHeaderPanel";
import { GADMSelectBodyPanel } from "./GADMSelectBodyPanel";
import { CheckboxState, GADMService } from "../services/GADMService";

const SelectorTable = styled(Table)`
  & > tbody > tr > td {
    background-color: rgba(245, 245, 245);
  }
`;

interface GADMResourceSelectorPanelProps {
  downloadedMatrix: boolean[][];
  checkboxMatrix: boolean[][];
  countryIndexPageUrl: string;
  readonly countryMetadataArray: CountryMetadata[];
  readonly maxAdminLevel: number;
  handleCheckedCountChange: (count: number) => void;
  handleCheckboxMatrixChange: (matrix: boolean[][]) => void;
  handleCountryIndexPageUrlChange: (url: string) => void;
}

const GADMSelectPanelCore = ({
  downloadedMatrix,
  checkboxMatrix,
  countryIndexPageUrl,
  countryMetadataArray,
  maxAdminLevel,
  handleCheckedCountChange,
  handleCheckboxMatrixChange,
  handleCountryIndexPageUrlChange,
}: GADMResourceSelectorPanelProps) => {
  const handleContryIndexPageUrlChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleCountryIndexPageUrlChange(event.target.value);
  };

  const headerCheckboxState = useMemo(
    () =>
      GADMService.createHeaderCheckboxState(
        checkboxMatrix,
        maxAdminLevel,
        countryMetadataArray,
      ),
    [checkboxMatrix, maxAdminLevel, countryMetadataArray],
  );

  useEffect(() => {
    handleCheckedCountChange(headerCheckboxState.checkedCount);
  }, [headerCheckboxState.checkedCount]);

  // チェックボックスの状態を更新する関数
  const handleCheckboxMatrixChangeFactory = useCallback(
    (rowIndex: number, columnIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(checkboxMatrix, (draft: boolean[][]) => {
            draft[rowIndex][columnIndex] = !draft[rowIndex][columnIndex];
          }),
        );
    },
    [checkboxMatrix],
  );

  // 行見出しまたは列見出しのチェックボックスを更新する関数
  const handleRowHeaderCheckboxChangeFactory = useCallback(
    (rowIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(checkboxMatrix, (draft: boolean[][]) => {
            const newValue =
              headerCheckboxState.rowHeader[rowIndex] !== CheckboxState.Checked;
            headerCheckboxState.rowHeader[rowIndex] = newValue
              ? CheckboxState.Checked
              : CheckboxState.Unchecked;
            for (
              let columnIndex = 0;
              columnIndex < draft[rowIndex].length;
              columnIndex++
            ) {
              draft[rowIndex][columnIndex] = newValue;
            }
          }),
        );
    },
    [headerCheckboxState.rowHeader],
  );

  const handleColumnHeaderCheckboxChange = useCallback(
    (columnIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(checkboxMatrix, (draft: boolean[][]) => {
            const newValue =
              headerCheckboxState.columnHeader[columnIndex] !==
              CheckboxState.Checked;
            headerCheckboxState.columnHeader[columnIndex] = newValue
              ? CheckboxState.Checked
              : CheckboxState.Unchecked;
            for (let rowIndex = 0; rowIndex < draft.length; rowIndex++) {
              if (columnIndex < draft[rowIndex].length) {
                draft[rowIndex][columnIndex] = newValue;
              }
            }
          }),
        );
    },
    [headerCheckboxState.columnHeader],
  );

  const handleAllCheckboxChange = useCallback(() => {
    handleCheckboxMatrixChange(
      produce(checkboxMatrix, (draft: boolean[][]) => {
        const newValue =
          headerCheckboxState.northWestHeader !== CheckboxState.Checked;
        for (let rowIndex = 0; rowIndex < draft.length; rowIndex++) {
          for (
            let columnIndex = 0;
            columnIndex < draft[rowIndex].length;
            columnIndex++
          ) {
            draft[rowIndex][columnIndex] = newValue;
          }
        }
        return draft;
      }),
    );
  }, [headerCheckboxState.northWestHeader]);

  return (
    <>
      <TextField
        fullWidth
        id="countryIndexPageUrl"
        label="Country Index Page URL"
        value={countryIndexPageUrl}
        onChange={handleContryIndexPageUrlChanged}
      />
      <Box>
        <SelectorTable stickyHeader size="small">
          <TableHead>
            <TableRow>
              <GADMSelectHeaderPanel
                maxAdminLevel={maxAdminLevel}
                northWestHeaderChecked={
                  headerCheckboxState.northWestHeader === CheckboxState.Checked
                }
                northWestHeaderIndetermined={
                  headerCheckboxState.northWestHeader ===
                  CheckboxState.Indeterminate
                }
                columnHeaderChecked={headerCheckboxState.columnHeader.map(
                  (state) => state === CheckboxState.Checked,
                )}
                columnHeaderIndetermined={headerCheckboxState.columnHeader.map(
                  (state) => state === CheckboxState.Indeterminate,
                )}
                handleNorthWestCheckboxChange={handleAllCheckboxChange}
                handleColumnHeaderCheckboxChange={
                  handleColumnHeaderCheckboxChange
                }
              />
            </TableRow>
          </TableHead>
          <TableBody>
            <GADMSelectBodyPanel
              maxAdminLevel={maxAdminLevel}
              rowHeaderChecked={headerCheckboxState.rowHeader.map(
                (state) => state === CheckboxState.Checked,
              )}
              rowHeaderIndetermined={headerCheckboxState.rowHeader.map(
                (state) => state === CheckboxState.Indeterminate,
              )}
              downloadedMatrix={downloadedMatrix}
              checkboxMatrix={checkboxMatrix}
              countryMetadataArray={countryMetadataArray}
              handleRowHeaderCheckboxChangeFactory={
                handleRowHeaderCheckboxChangeFactory
              }
              handleCheckboxMatrixChangeFactory={
                handleCheckboxMatrixChangeFactory
              }
            />
          </TableBody>
        </SelectorTable>
      </Box>
    </>
  );
};
export const GADMSelectPanel = memo(GADMSelectPanelCore);
