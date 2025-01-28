import {
  DialogTitle,
  Step,
  StepButton,
  Stepper,
  Typography,
} from "@mui/material";
import React from "react";
import { memo } from "react";

const GADMDialogTitleCore = ({
  title,
  currentStepIndex,
  completedStepIndex,
  labels,
}: {
  title: string;
  currentStepIndex: number;
  completedStepIndex: number;
  labels: string[];
}) => {
  return (
    <DialogTitle>
      <Typography>{title}</Typography>
      <Stepper
        activeStep={currentStepIndex}
        style={{ marginLeft: "48px", marginRight: "48px", marginTop: "16px" }}
      >
        {labels.map((label, index) => (
          <Step key={label} completed={index <= completedStepIndex}>
            <StepButton color="inherit">{label}</StepButton>
          </Step>
        ))}
      </Stepper>
    </DialogTitle>
  );
};
export const GADMDialogTitle = memo(GADMDialogTitleCore);
