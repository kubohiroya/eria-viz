import React from "react";
import { memo } from "react";
import { DownloadShapePanelProps } from "./DownloadShapePanelProps";
import { Table, TableBody, TableHead, TableRow } from "@mui/material";
import { DownloadShapeHeaderPanel } from "./DownloadShapeHeaderPanel";
import { DownloadShapeBodyPanel } from "./DownloadShapeBodyPanel";

export const DownloadShapePanelCore = ({
  maxAdminLevel,
  downloadCountryMetadataArray,
  downloadStatusMatrix,
}: DownloadShapePanelProps) => {
  return (
    <>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <DownloadShapeHeaderPanel maxAdminLevel={maxAdminLevel} />
          </TableRow>
        </TableHead>
        <TableBody>
          <DownloadShapeBodyPanel
            maxAdminLevel={maxAdminLevel}
            downloadCountryMetadataArray={downloadCountryMetadataArray}
            downloadStatusMatrix={downloadStatusMatrix}
          />
        </TableBody>
      </Table>
    </>
  );
};
export const DownloadShapePanel = memo(DownloadShapePanelCore);
