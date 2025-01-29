import { Close } from "@mui/icons-material"
import {Box, Button, DialogActions, IconButton, Typography } from "@mui/material"
import React, { ReactNode } from "react"
import { memo } from "react"

type GJDialogActionsProps = {
    hideDialog: ()=>void
    handleBack: ()=>void
    handleNext: ()=>void
    currentStepIndex: number
    isNextButtonEnabled: boolean,
    numSteps: number,
    footer: ReactNode,
    nextButtonRef: any
}
const GJDialogActionsCore = ({
    hideDialog,
    handleBack,
    handleNext,
    currentStepIndex,
                                   isNextButtonEnabled,
                                   numSteps,
    footer,
    nextButtonRef
                               }: GADMDialogActionsProps)=>{
    return (
        <DialogActions sx={{ margin: "10px" }}>
            <IconButton
                size="large"
                sx={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                }}
                onClick={hideDialog}
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
                        : "Finish"
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