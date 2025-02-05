import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type CountryMetadata } from "../../types/CountryMetadata";
import { produce } from "immer";
import { CountryAdminsMatrixHeaderPanel } from "./CountryAdminsMatrixHeaderPanel";
import { CheckboxState, GeoJsonService } from "../../services/GeoJsonService";
import { TableVirtuoso } from "react-virtuoso";
import { CountryAdminsMatrixBodyRow } from "./CountryAdminsMatrixBodyRow";
import { useCountryAdminsContext } from "../../hooks/useCountryAdminsContext";
import { useCountryMetadataContext } from "../../hooks/useCountryMetadata";
import { SourceHosts } from "../../types/SourceHosts";
import { useSourceHostsContext } from "../../hooks/useSourceHostsContext";
import { useGeoJsonServiceContext } from "../../hooks/useGeoJsonServiceContext";

interface CountryAdminsMatrixPanelProps {
  downloadedMatrix: boolean[][];
  countryIndexPageUrl: string;
  countryMetadataArray: CountryMetadata[];
  numAdminLevels: number;
  handleCheckedCountChange: (count: number) => void;
  handleCheckboxMatrixChange: (matrix: boolean[][]) => void;
}

const CountryAdminsMatrixPanelCore = ({
  downloadedMatrix,
  countryIndexPageUrl,
  numAdminLevels,
  handleCheckedCountChange,
  handleCheckboxMatrixChange,
}: CountryAdminsMatrixPanelProps) => {
  const countryMetadataContext = useCountryMetadataContext();
  const countryAdminContext = useCountryAdminsContext();
  const geoJsonServiceContext = useGeoJsonServiceContext();

  const virtuoso = useRef(null);

  const headerCheckboxState = useMemo(
    () =>
      GeoJsonService.createHeaderCheckboxState(
        countryAdminContext.selectCheckboxMatrix,
        numAdminLevels,
        countryMetadataContext.countryMetadataArray,
      ),
    [
      countryAdminContext.selectCheckboxMatrix,
      numAdminLevels,
      countryMetadataContext.countryMetadataArray,
    ],
  );

  const IndexTable = () => {
    const map = new Map<string, number>();
    countryMetadataContext.countryMetadataArray.forEach(
      (countryMetadata, index) => {
        const chr = countryMetadata.countryName.charAt(0);
        if (!map.has(chr)) {
          map.set(chr, index);
        }
      },
    );
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2px",
          marginTop: "10px",
          paddingTop: "4px",
          background: "#f5f5f5",
        }}
      >
        {[
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
        ].map((char: string) => (
          <IconButton
            size="small"
            key={char}
            onClick={() => {
              (virtuoso.current as any).scrollToIndex({
                index: map.get(char) ?? 0,
                behavior: "auto",
              });
            }}
          >
            {char}
          </IconButton>
        ))}
      </Box>
    );
  };

  // チェックボックスの状態を更新する関数
  const handleCheckboxMatrixChangeFactory = useCallback(
    (rowIndex: number, columnIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(
            countryAdminContext.selectCheckboxMatrix,
            (draft: boolean[][]) => {
              draft[rowIndex][columnIndex] = !draft[rowIndex][columnIndex];
            },
          ),
        );
    },
    [countryAdminContext.selectCheckboxMatrix],
  );

  // 行見出しまたは列見出しのチェックボックスを更新する関数
  const handleRowHeaderCheckboxChangeFactory = useCallback(
    (rowIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(
            countryAdminContext.selectCheckboxMatrix,
            (draft: boolean[][]) => {
              const newValue =
                headerCheckboxState.rowHeader[rowIndex] !==
                CheckboxState.Checked;
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
            },
          ),
        );
    },
    [headerCheckboxState.rowHeader],
  );

  const handleColumnHeaderCheckboxChange = useCallback(
    (columnIndex: number) => {
      return () =>
        handleCheckboxMatrixChange(
          produce(
            countryAdminContext.selectCheckboxMatrix,
            (draft: boolean[][]) => {
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
            },
          ),
        );
    },
    [headerCheckboxState.columnHeader],
  );

  const handleAllCheckboxChange = useCallback(() => {
    handleCheckboxMatrixChange(
      produce(
        countryAdminContext.selectCheckboxMatrix,
        (draft: boolean[][]) => {
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
        },
      ),
    );
  }, [headerCheckboxState.northWestHeader, countryAdminContext.selectCheckboxMatrix]);

  useEffect(() => {
    handleCheckedCountChange(headerCheckboxState.checkedCount);
  }, [headerCheckboxState.checkedCount]);

  const sourceHostsContext = useSourceHostsContext();
  const [sourceHostName, setSourceHostName] = useState<string>(
    sourceHostsContext.sourceHostName,
  );

  const handleSelectSourceHost = useCallback((event: any) => {
    const newSourceHostName = event.target.value as string;
    setSourceHostName(newSourceHostName);
    sourceHostsContext.setSourceHostName(newSourceHostName);
  }, []);

  return (
    <>
      <Box>
        <FormControl
          sx={{ margin: 1, width: "98%", alignSelf: "center" }}
          size="medium"
        >
          <InputLabel id={"source-select-label"}>Source</InputLabel>
          <Select
            readOnly
            id={"source-select"}
            value={sourceHostName}
            label={"Source"}
            onChange={handleSelectSourceHost}
          >
            {Object.keys(
              geoJsonServiceContext?.geoJsonService?.catalog.properties
                .licenseAgreement,
            )
              .sort()
              .map((sourceName: string, index: number) => (
                <MenuItem key={index} value={sourceName}>
                  {SourceHosts[sourceName]?.sourceHostName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          aria-readonly
          id="countryIndexPageUrl"
          label="Country Index Page URL"
          value={countryIndexPageUrl}
        />
      </Box>
      <IndexTable />
      <Box>
        {countryAdminContext.selectCheckboxMatrix.length === 0 ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableVirtuoso
            ref={virtuoso}
            style={{ height: 500 }}
            fixedHeaderContent={() => (
              <CountryAdminsMatrixHeaderPanel
                numAdminLevels={numAdminLevels}
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
            )}
            data={countryMetadataContext.countryMetadataArray}
            itemContent={(index, countryMetadata) => (
              <CountryAdminsMatrixBodyRow
                numAdminLevels={numAdminLevels}
                downloadedMatrix={downloadedMatrix}
                checkboxMatrix={countryAdminContext.selectCheckboxMatrix}
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
          />
        )}
      </Box>
    </>
  );
};
export const CountryAdminsMatrixPanel = memo(CountryAdminsMatrixPanelCore);
