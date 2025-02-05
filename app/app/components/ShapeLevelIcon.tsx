import {
  Domain,
  Flag,
  LocationCity,
  Villa,
  VillaOutlined,
} from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import React, { memo } from "react";

export type GJIconProps = {
  level: number;
};

const ShapeLevelIconCore = ({ level }: GJIconProps) => {
  return (
    <Tooltip
      title={`Level ${level}: ${level === 0 ? "Country" : level === 1 ? "Division" : level === 2 ? "Subdivision" : level === 3 ? "Subsubdivision" : ""}`}
    >
      <Typography sx={{ fontStyle: "bold" }}>
        {level === 0 ? (
          <Flag />
        ) : level === 1 ? (
          <LocationCity />
        ) : level === 2 ? (
          <Domain />
        ) : level === 3 ? (
          <Villa />
        ) : level === 4 ? (
          <VillaOutlined />
        ) : (
          ""
        )}
        Level {level}
      </Typography>
    </Tooltip>
  );
};
export const ShapeLevelIcon = memo(ShapeLevelIconCore);
