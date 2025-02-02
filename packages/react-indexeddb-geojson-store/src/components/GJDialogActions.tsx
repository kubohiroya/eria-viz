import { Close } from "@mui/icons-material"
import {Box, Button, DialogActions, IconButton, Typography } from "@mui/material"
import React, { ReactNode } from "react"
import { memo } from "react"
import { useDialogContext } from "../hooks/useDialogContext"

type GJActionsProps = {
    closeDialog: ()=>void
    handleBack: ()=>void
    handleNext: ()=>void
    numSteps: number,
    nextButtonRef: any
}
const GJDialogActionsCore = ({
    closeDialog: closeDialog,
    handleBack,
    handleNext,
                                 numSteps,
    nextButtonRef
                               }: GJActionsProps)=>{

    const {isNextButtonEnabled, currentStepIndex, footer} = useDialogContext();

    return (
        <DialogActions sx={{ margin: "10px" }}>
            <IconButton
                size="large"
                sx={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                }}
                onClick={closeDialog}
            >
                <Close style={{ width: "40px", height: "40px" }} />
            </IconButton>
            <Button
                size="large"
                style={{ padding: "16px 48px 16px 48px" }}
                variant={"contained"}
                color="inherit"
                onClick={handleBack}
            >
                {currentStepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Box sx={{ flex: "1 1 auto"}}>
                <Typography textAlign={"right"}>{footer}</Typography>
            </Box>
            <Button
                size="large"
                style={{ padding: "16px 48px 16px 48px" }}
                variant={"contained"}
                disabled={!isNextButtonEnabled}
                title={
                    currentStepIndex < numSteps - 1
                        ? `Step ${currentStepIndex + 1}`
                        : 'Finish'
                }
                onClick={handleNext}
                ref={nextButtonRef}
            >
                {currentStepIndex < numSteps - 1 ? "Next" : "Finish"}
            </Button>
        </DialogActions>
    )
}
export const GJDialogActions = memo(GJDialogActionsCore)