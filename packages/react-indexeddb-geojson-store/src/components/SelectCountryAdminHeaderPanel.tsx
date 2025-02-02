import { Checkbox, TableCell, TableRow, Typography } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../utils/arrayUtils";
import { ShapeIcon } from "./ShapeIcon";

const SelectCountryAdminHeaderPanelCore = ({
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
      <TableRow style={{background: "#f5f5f5"}}>
      <TableCell key="-1" scope="row" sx={{ width: 1 / 4 }} >
        <Checkbox
          checked={northWestHeaderChecked}
          indeterminate={northWestHeaderIndetermined}
          onChange={handleNorthWestCheckboxChange}
          name={"all"}
        />
        <Typography sx={{ fontStyle: "bold" }}>Select/Unselect All</Typography>
      </TableCell>
      {createNumberArray(maxAdminLevel).map((level) => (
        <TableCell key={level} scope="row" sx={{ width: 3 / 20}}>
          <Checkbox
            checked={columnHeaderChecked[level] ?? false}
            indeterminate={columnHeaderIndetermined[level] ?? false}
            onChange={handleColumnHeaderCheckboxChange(level)}
            name={`${level}`}
          />
          <ShapeIcon level={level} />
        </TableCell>
      ))}
      </TableRow>
    </>
  );
};
export const SelectCountryAdminHeaderPanel = memo(SelectCountryAdminHeaderPanelCore);
