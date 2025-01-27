import {
  Box,
  Checkbox,
  CircularProgress,
  TableCell,
  TableRow,
} from "@mui/material";
import React, { memo } from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { createNumberArray } from "../utils/arrayUtils";
import { createGADMCountryUrl, createGADMRegionUrl } from "../utils/GADMUtils";

const GADMSelectBodyPanelCore = ({
  maxAdminLevel,
  rowHeaderChecked,
  rowHeaderIndetermined,
  checkboxMatrix,
  countryMetadataArray,
  handleRowHeaderCheckboxChangeFactory,
  handleCheckboxMatrixChangeFactory,
}: {
  maxAdminLevel: number;
  rowHeaderChecked: boolean[];
  rowHeaderIndetermined: boolean[];
  checkboxMatrix: boolean[][];
  countryMetadataArray: CountryMetadata[];
  handleRowHeaderCheckboxChangeFactory: (rowIndex: number) => () => void;
  handleCheckboxMatrixChangeFactory: (
    rowIndex: number,
    columnIndex: number,
  ) => () => void;
}) => {
  if (checkboxMatrix.length === 0) {
    return (
      <TableRow>
        <TableCell component="th" scope="row" colSpan={maxAdminLevel + 1}>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px",
            }}
          >
            <CircularProgress />
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return countryMetadataArray.map((item, dataIndex) => (
    <TableRow key={dataIndex}>
      <TableCell component="th" scope="row">
        <Checkbox
          checked={rowHeaderChecked[dataIndex] ?? false}
          indeterminate={rowHeaderIndetermined[dataIndex] ?? false}
          onChange={handleRowHeaderCheckboxChangeFactory(dataIndex)}
          name={dataIndex.toString()}
        />
        <a
          href={createGADMCountryUrl(item.countryCode)}
          target="_blank"
          rel="noreferrer"
        >
          {item.countryName}({item.countryCode})
        </a>
      </TableCell>
      {createNumberArray(maxAdminLevel).map((level: number) => (
        <TableCell key={level}>
          {level <= item.maxAdminLevel && (
            <>
              <Checkbox
                checked={checkboxMatrix[dataIndex]?.[level] ?? false}
                onChange={handleCheckboxMatrixChangeFactory(dataIndex, level)}
                name={`${dataIndex}_${level}`}
              />
              {level === 0 && (
                <a
                  href={createGADMCountryUrl(item.countryCode)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {level}
                </a>
              )}
              {level === 1 && (
                <a
                  href={createGADMRegionUrl(item.countryCode, level)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {level}
                </a>
              )}
            </>
          )}
        </TableCell>
      ))}
    </TableRow>
  ));
};

export const GADMSelectBodyPanel = memo(GADMSelectBodyPanelCore);
