import React from "react";
import { memo } from "react";
import { GJDownloadPanelProps } from "./GJDownloadPanelProps";
import { Table, TableBody, TableHead, TableRow } from "@mui/material";
import { GJDownloadHeaderPanel } from "./GJDownloadHeaderPanel";
import { GJDownloadBodyPanel } from "./GJDownloadBodyPanel";

export const GJDownloadPanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: GJDownloadPanelProps) => {
  return (
    <>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <GJDownloadHeaderPanel maxAdminLevel={maxAdminLevel} />
          </TableRow>
        </TableHead>
        <TableBody>
          <GJDownloadBodyPanel
            maxAdminLevel={maxAdminLevel}
            downloadCountryMetadataArray={downloadCountryMetadataArray}
            downloadStatusMatrix={downloadStatusMatrix}
          />
        </TableBody>
      </Table>
    </>
  );
};
export const GJDownloadPanel = memo(GJDownloadPanelCore);
