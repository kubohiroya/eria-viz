import { TableCell } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../utils/arrayUtils";
import { GADMIcon } from "./GADMIcon";

const GADMDownloadHeaderPanelCore = ({
  maxAdminLevel,
}: {
  maxAdminLevel: number;
}) => {
  return (
    <>
      <TableCell key="-1" component="th" scope="row"></TableCell>
      {createNumberArray(maxAdminLevel).map((level) => (
        <TableCell key={level} component="th" scope="row">
          <GADMIcon level={level} />
        </TableCell>
      ))}
    </>
  );
};
export const GADMDownloadHeaderPanel = memo(GADMDownloadHeaderPanelCore);
