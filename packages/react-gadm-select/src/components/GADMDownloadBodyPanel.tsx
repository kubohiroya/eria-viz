import {
  CircularProgress,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { memo } from "react";
import { CountryMetadata } from "../types/CountryMetadata";
import { createNumberArray } from "../utils/arrayUtils";
import { DownloadDone } from "@mui/icons-material";
import { DownloadStatus } from "../types/DownloadStatus";
import { GADMService } from "../services/GADMService";

const DownloadingIcon = ({
  state,
}: {
  state: DownloadStatus | number | undefined;
}) => {
  if (state === undefined) {
    return null;
  }

  switch (state) {
    case DownloadStatus.NonTarget:
      return <Typography color={"lightGray"}>-</Typography>;
    case DownloadStatus.Initialized:
      return <CircularProgress size={10} />;
    case DownloadStatus.Finished:
      return <DownloadDone />;
    case DownloadStatus.Downloading:
    default:
      return <CircularProgress size={10} value={state} />;
  }
};

const GADMDownloadBodyPanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: {
  maxAdminLevel: number;
  downloadCountryMetadataArray: CountryMetadata[];
  downloadStatusMatrix: DownloadStatus[][];
}) => {
  return downloadCountryMetadataArray.map(
    (item: CountryMetadata, dataIndex: number) => (
      <TableRow key={dataIndex}>
        <TableCell component="th" scope="row">
          <a
            href={GADMService.createGADMCountryUrl(item.countryCode)}
            target="_blank"
            rel="noreferrer"
          >
            {item.countryName}({item.countryCode})
          </a>
        </TableCell>
        {createNumberArray(maxAdminLevel).map((level: number) => (
          <TableCell key={level}>
            {level <= item.maxAdminLevel && (
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
export const GADMDownloadBodyPanel = memo(GADMDownloadBodyPanelCore);
