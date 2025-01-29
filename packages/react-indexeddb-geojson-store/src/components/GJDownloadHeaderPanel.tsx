import { TableCell } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../utils/arrayUtils";
import { GJIcon } from "./GJIcon";

const GADMDownloadHeaderPanelCore = ({
  maxAdminLevel,
}: {
  maxAdminLevel: number;
}) => {
  return (
    <>
      <TableCell key="-1" component="th" scope="row"></TableCell>
      {createNumberArray(maxAdminLevel).map((level) => (
        <TableCell key={level} component="th" scope="row" align="center">
          <GJIcon level={level} />
        </TableCell>
      ))}
    </>
  );
};
export const GJDownloadHeaderPanel = memo(GADMDownloadHeaderPanelCore);
