import React from "react";
import { memo } from "react";
import { DownloadShapesMatrixPanelProps } from "./DownloadShapesMatrixPanelProps";
import { Table, TableBody, TableHead, TableRow } from "@mui/material";
import { DownloadShapesMatrixHeaderPanel } from "./DownloadShapesMatrixHeaderPanel";
import { DownloadShapesMatrixBodyPanel } from "./DownloadShapesMatrixBodyPanel";

export const DownloadShapePanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: DownloadShapesMatrixPanelProps) => {
  return (
    <>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <DownloadShapesMatrixHeaderPanel maxAdminLevel={maxAdminLevel} />
          </TableRow>
        </TableHead>
        <TableBody>
          <DownloadShapesMatrixBodyPanel
            maxAdminLevel={maxAdminLevel}
            downloadCountryMetadataArray={downloadCountryMetadataArray}
            downloadStatusMatrix={downloadStatusMatrix}
          />
        </TableBody>
      </Table>
    </>
  );
};
export const DownloadShapesMatrixPanel = memo(DownloadShapePanelCore);
