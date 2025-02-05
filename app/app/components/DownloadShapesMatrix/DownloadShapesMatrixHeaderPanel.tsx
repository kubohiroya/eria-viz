import { TableCell } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../../utils/arrayUtils";
import { ShapeLevelIcon } from "./../ShapeLevelIcon";

const DownloadShapeHeaderPanelCore = ({
  maxAdminLevel,
}: {
  maxAdminLevel: number;
}) => {
  return (
    <>
      <TableCell key="-1" component="th" scope="row"></TableCell>
      {createNumberArray(maxAdminLevel).map((level) => (
        <TableCell key={level} component="th" scope="row" align="center">
          <ShapeLevelIcon level={level} />
        </TableCell>
      ))}
    </>
  );
};
export const DownloadShapesMatrixHeaderPanel = memo(DownloadShapeHeaderPanelCore);
