import { Typography } from "@mui/material";
import React from "react";

export const GJDialogStepTitle = ({
  label,
  title,
}: {
  label: string;
  title: string;
}) => {
  return (
    <Typography
      sx={{
        fontSize: "14px",
        fontStyle: "bold",
        marginBottom: "16px",
      }}
    >
      {label}: {title}
    </Typography>
  );
};
