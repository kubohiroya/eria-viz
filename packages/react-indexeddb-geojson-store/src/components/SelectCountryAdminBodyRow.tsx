import {
  Box,
  Checkbox,
  CircularProgress,
  TableCell,
  TableRow,
} from "@mui/material";
import React from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { createNumberArray } from "../utils/arrayUtils";
import {CheckboxState, GeoJsonService, HeaderCheckboxState } from "../services/GeoJsonService";
import { FileDownload, FileDownloadDone } from "@mui/icons-material";
import { InlineIcon } from "./InlineIcon/InlineIcon";

const FileDownloadReservedIcon = () => {
  return (
    <FileDownload
      style={{
        width: "24px",
        height: "24px",
        color: "gray",
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: "2px",
        borderRadius: "3px",
      }}
    />
  );
};

const FileDownloadNotReservedIcon = () => {
  return (
    <span
      style={{
        width: "24px",
        height: "24px",
        color: "lightGray",
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: "2px",
        borderRadius: "3px",
      }}
    />
  );
};

const FileAlreadyDownloadedIcon = () => {
  return (
    <FileDownloadDone
      style={{
        width: "24px",
        height: "24px",
        color: "lightGray",
      }}
    />
  );
};

export const SelectCountryAdminBodyRow = ({
                                            item,
                                            dataIndex,
  maxAdminLevel,
  headerCheckboxState,
  downloadedMatrix,
  checkboxMatrix,
  handleRowHeaderCheckboxChangeFactory,
  handleCheckboxMatrixChangeFactory,
}: {
  item: CountryMetadata;
  dataIndex: number;
  maxAdminLevel: number;
  headerCheckboxState: HeaderCheckboxState;
  downloadedMatrix: boolean[][];
  checkboxMatrix: boolean[][];
  handleRowHeaderCheckboxChangeFactory: (rowIndex: number) => () => void;
  handleCheckboxMatrixChangeFactory: (
    rowIndex: number,
    columnIndex: number,
  ) => () => void;
}) => {

  const rowHeaderChecked = headerCheckboxState.rowHeader[dataIndex] === CheckboxState.Checked
  const rowHeaderIndetermined = headerCheckboxState.rowHeader[dataIndex] === CheckboxState.Indeterminate

  return (
    <>
      <TableCell component="th" scope="row" sx={{ width: 1 / 4 }}>
        <Checkbox
          checked={rowHeaderChecked ?? false}
          indeterminate={rowHeaderIndetermined ?? false}
          onChange={handleRowHeaderCheckboxChangeFactory(dataIndex)}
          name={dataIndex.toString()}
        />
        <a
          href={GeoJsonService.createCountryUrl(item.countryCode)}
          target="_blank"
          rel="noreferrer"
        >
          {item.countryName}({item.countryCode})
        </a>
      </TableCell>
      {createNumberArray(maxAdminLevel).map((level: number) => (
        <TableCell key={level} sx={{ width: 3 / 20 }}>
          {level <= item.maxAdminLevel && (
            <>
              <Checkbox
                icon={<FileDownloadNotReservedIcon />}
                checkedIcon={<FileDownloadReservedIcon />}
                checked={checkboxMatrix[dataIndex]?.[level] ?? false}
                onChange={handleCheckboxMatrixChangeFactory(dataIndex, level)}
                name={`${dataIndex}_${level}`}
              />
              <InlineIcon>
                {downloadedMatrix[dataIndex]?.[level] ? (
                  <FileAlreadyDownloadedIcon />
                ) : (
                  level === 0 && (
                    <a
                      href={GeoJsonService.createCountryUrl(item.countryCode)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {level}
                    </a>
                  )
                )}
                {level === 1 && (
                  <a
                    href={GeoJsonService.createAdminUrl(
                      item.countryCode,
                      level,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {level}
                  </a>
                )}
              </InlineIcon>
            </>
          )}
        </TableCell>
      ))}
    </>
  );
};

