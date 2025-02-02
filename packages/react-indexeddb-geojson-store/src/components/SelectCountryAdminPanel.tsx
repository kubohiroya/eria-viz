import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { produce } from "immer";
import { SelectCountryAdminHeaderPanel } from "./SelectCountryAdminHeaderPanel";
import { CheckboxState, GeoJsonService } from "../services/GeoJsonService";
import {TableVirtuoso} from "react-virtuoso";
import { SelectCountryAdminBodyRow } from "./SelectCountryAdminBodyRow";
/*
const SelectorTable = styled(Table)`
  & > tbody > tr > td {
    background-color: rgba(245, 245, 245);
  }
`;
 */

interface SelectCountryAdminPanelProps {
  downloadedMatrix: boolean[][];
  checkboxMatrix: boolean[][];
  countryIndexPageUrl: string;
  countryMetadataArray: CountryMetadata[];
  maxAdminLevel: number;
  handleCheckedCountChange: (count: number) => void;
  handleCheckboxMatrixChange: (matrix: boolean[][]) => void;
}

const SelectCountryAdminPanelCore = ({
  downloadedMatrix,
  checkboxMatrix,
  countryIndexPageUrl,
  countryMetadataArray,
  maxAdminLevel,
  handleCheckedCountChange,
  handleCheckboxMatrixChange,
}: SelectCountryAdminPanelProps) => {

  const virtuoso = useRef(null);

  const headerCheckboxState = useMemo(
    () =>
      GeoJsonService.createHeaderCheckboxState(
        checkboxMatrix,
        maxAdminLevel,
        countryMetadataArray,
      ),
    [checkboxMatrix, maxAdminLevel, countryMetadataArray],
  );

  const IndexTable = () => {
    const map = new Map<string, number>();
    countryMetadataArray.forEach((countryMetadata, index) => {
      const chr = countryMetadata.countryName.charAt(0);
      if (!map.has(chr)) {
        map.set(chr, index);
      }
    });
    return (
        <Box style={{display: "flex", justifyContent: "center", gap: "2px", marginTop: "10px", paddingTop: "4px",
           background: "#f5f5f5"}}>
        {
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((char: string) => (
            <IconButton
              size='small'
              key={char}
              onClick={() => {
                (virtuoso.current as any).scrollToIndex({index: map.get(char) ?? 0, behavior: "auto"})
              }}
            >{char}
            </IconButton>
          ))
        }
        </Box>
    );
  }

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
        aria-readonly
        id="countryIndexPageUrl"
        label="Country Index Page URL"
        value={countryIndexPageUrl}
      />
      <IndexTable />
      <Box>
        {(checkboxMatrix.length === 0)?
        (

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px",
          }}
        >
          <CircularProgress />
        </Box>
  ):(
  <TableVirtuoso
    ref={virtuoso}
    style={{ height: 500 }}
    fixedHeaderContent={()=>
            (
              <SelectCountryAdminHeaderPanel
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
              />)
          }
          data={countryMetadataArray}
          itemContent={(index, countryMetadata) => (
              <SelectCountryAdminBodyRow
                maxAdminLevel={maxAdminLevel}
                downloadedMatrix={downloadedMatrix}
                checkboxMatrix={checkboxMatrix}
                item={countryMetadata}
                headerCheckboxState={headerCheckboxState}
                dataIndex={index}
                handleRowHeaderCheckboxChangeFactory={
                  handleRowHeaderCheckboxChangeFactory
                }
                handleCheckboxMatrixChangeFactory={
                  handleCheckboxMatrixChangeFactory
                }
              />
          )}
        />)}
      </Box>
    </>
  );
};
export const SelectCountryAdminPanel = memo(SelectCountryAdminPanelCore);

/*
        />
            <SelectCountryAdminBodyPanel
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
      }

 */