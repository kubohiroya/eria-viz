import { CircularProgress, TableCell, TableRow } from "@mui/material";
import React, { memo } from "react";
import { type CountryMetadata } from "../../types/CountryMetadata";
import { createNumberArray } from "../../utils/arrayUtils";
import { DownloadStatus } from "../../types/DownloadStatus";
import { GeoJsonService } from "../../services/GeoJsonService";
import { DownloadingIcon } from "./DownloadingIcon";

const DownloadShapesMatrixBodyPanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: {
  maxAdminLevel: number;
  downloadCountryMetadataArray: CountryMetadata[];
  downloadStatusMatrix: DownloadStatus[][];
}) => {
  if (downloadCountryMetadataArray.length === 0) {
    <TableRow>
      <TableCell colSpan={maxAdminLevel + 1} align="center">
        <CircularProgress />
      </TableCell>
    </TableRow>;
  }
  return downloadCountryMetadataArray.map(
    (item: CountryMetadata, dataIndex: number) => (
      <TableRow key={dataIndex}>
        <TableCell component="th" scope="row">
          <a
            href={GeoJsonService.createCountryUrl(item.countryCode)}
            target="_blank"
            rel="noreferrer"
          >
            {item.countryName}({item.countryCode})
          </a>
        </TableCell>
        {createNumberArray(maxAdminLevel).map((level: number) => (
          <TableCell key={level} align="center">
            {level <= item.numAdminLevels && (
              <DownloadingIcon
                state={downloadStatusMatrix[dataIndex]?.[level]}
              />
            )}
          </TableCell>
        ))}
      </TableRow>
    ),
  );
};
export const DownloadShapesMatrixBodyPanel = memo(DownloadShapesMatrixBodyPanelCore);
