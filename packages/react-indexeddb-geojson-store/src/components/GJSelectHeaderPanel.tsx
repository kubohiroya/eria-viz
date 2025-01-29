import { Checkbox, TableCell, Typography } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../utils/arrayUtils";
import { GJIcon } from "./GJIcon";

const GJSelectHeaderPanelCore = ({
  maxAdminLevel,
  northWestHeaderChecked,
  northWestHeaderIndetermined,
  columnHeaderChecked,
  columnHeaderIndetermined,
  handleNorthWestCheckboxChange,
  handleColumnHeaderCheckboxChange,
}: {
  maxAdminLevel: number;
  northWestHeaderChecked: boolean;
  northWestHeaderIndetermined: boolean;
  columnHeaderChecked: boolean[];
  columnHeaderIndetermined: boolean[];
  handleNorthWestCheckboxChange: () => void;
  handleColumnHeaderCheckboxChange: (columnIndex: number) => () => void;
}) => {
  return (
    <>
      <TableCell key="-1" component="th" scope="row">
        <Checkbox
          checked={northWestHeaderChecked}
          indeterminate={northWestHeaderIndetermined}
          onChange={handleNorthWestCheckboxChange}
          name={"all"}
        />
        <Typography sx={{ fontStyle: "bold" }}>Select/Unselect All</Typography>
      </TableCell>
      {createNumberArray(maxAdminLevel).map((level) => (
        <TableCell key={level} component="th" scope="row">
          <Checkbox
            checked={columnHeaderChecked[level] ?? false}
            indeterminate={columnHeaderIndetermined[level] ?? false}
            onChange={handleColumnHeaderCheckboxChange(level)}
            name={`${level}`}
          />
          <GJIcon level={level} />
        </TableCell>
      ))}
    </>
  );
};
export const GJSelectHeaderPanel = memo(GJSelectHeaderPanelCore);
