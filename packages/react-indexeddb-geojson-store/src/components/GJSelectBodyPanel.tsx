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
import { GJService } from "../services/GJService";
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

const GJSelectBodyPanelCore = ({
  maxAdminLevel,
  rowHeaderChecked,
  rowHeaderIndetermined,
  downloadedMatrix,
  checkboxMatrix,
  countryMetadataArray,
  handleRowHeaderCheckboxChangeFactory,
  handleCheckboxMatrixChangeFactory,
}: {
  maxAdminLevel: number;
  rowHeaderChecked: boolean[];
  rowHeaderIndetermined: boolean[];
  downloadedMatrix: boolean[][];
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
          href={GJService.createCountryUrl(item.countryCode)}
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
                      href={GJService.createCountryUrl(item.countryCode)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {level}
                    </a>
                  )
                )}
                {level === 1 && (
                  <a
                    href={GJService.createAdminUrl(
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
    </TableRow>
  ));
};

export const GJSelectBodyPanel = memo(GJSelectBodyPanelCore);
