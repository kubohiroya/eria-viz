import { Checkbox, TableCell, TableRow, Typography } from "@mui/material";
import React, { memo } from "react";
import { createNumberArray } from "../../utils/arrayUtils";
import { ShapeLevelIcon } from "../ShapeLevelIcon";

const CountryAdminsMatrixHeaderPanelCore = ({
  numAdminLevels,
  northWestHeaderChecked,
  northWestHeaderIndetermined,
  columnHeaderChecked,
  columnHeaderIndetermined,
  handleNorthWestCheckboxChange,
  handleColumnHeaderCheckboxChange,
}: {
  numAdminLevels: number;
  northWestHeaderChecked: boolean;
  northWestHeaderIndetermined: boolean;
  columnHeaderChecked: boolean[];
  columnHeaderIndetermined: boolean[];
  handleNorthWestCheckboxChange: () => void;
  handleColumnHeaderCheckboxChange: (columnIndex: number) => () => void;
}) => {
  return (
    <>
      <TableRow style={{ background: "#fff" }}>
        <TableCell key="-1" scope="row" style={{ width: 250 }}>
          <Checkbox
            checked={northWestHeaderChecked}
            indeterminate={northWestHeaderIndetermined}
            onChange={handleNorthWestCheckboxChange}
            name={"all"}
          />
          <Typography sx={{ fontStyle: "bold" }}>
            Select/Unselect All
          </Typography>
        </TableCell>
        {createNumberArray(numAdminLevels).map((level) => (
          <TableCell key={level} scope="row">
            <Checkbox
              checked={columnHeaderChecked[level] ?? false}
              indeterminate={columnHeaderIndetermined[level] ?? false}
              onChange={handleColumnHeaderCheckboxChange(level)}
              name={`${level}`}
            />
            <ShapeLevelIcon level={level} />
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};
export const CountryAdminsMatrixHeaderPanel = memo(
  CountryAdminsMatrixHeaderPanelCore,
);
