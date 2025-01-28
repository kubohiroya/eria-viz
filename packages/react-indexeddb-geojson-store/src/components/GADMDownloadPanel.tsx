import React from "react";
import { memo } from "react";
import { GADMDownloadPanelProps } from "./GADMDownloadPanelProps";
import { Table, TableBody, TableHead, TableRow } from "@mui/material";
import { GADMDownloadHeaderPanel } from "./GADMDownloadHeaderPanel";
import { GADMDownloadBodyPanel } from "./GADMDownloadBodyPanel";

export const GADMDownloadPanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: GADMDownloadPanelProps) => {
  return (
    <>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <GADMDownloadHeaderPanel maxAdminLevel={maxAdminLevel} />
          </TableRow>
        </TableHead>
        <TableBody>
          <GADMDownloadBodyPanel
            maxAdminLevel={maxAdminLevel}
            downloadCountryMetadataArray={downloadCountryMetadataArray}
            downloadStatusMatrix={downloadStatusMatrix}
          />
        </TableBody>
      </Table>
    </>
  );
};
export const GADMDownloadPanel = memo(GADMDownloadPanelCore);
