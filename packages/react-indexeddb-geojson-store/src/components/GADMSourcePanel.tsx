import React, { useCallback } from "react";
import { memo } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { InlineIcon } from "./InlineIcon/InlineIcon";
import { Launch } from "@mui/icons-material";
import { GADMSourcePanelProps, SourceMetadata } from "./GADMSourcePanelProps";
import { Link } from "react-router";

export const GADMSourcePanelCore = ({
  selectedSourceName,
  setSelectedSourceName,
  sourceNameArray,
  sources,
  agreeLicense,
}: GADMSourcePanelProps) => {
  const getEntry = (): SourceMetadata => {
    return (
      (selectedSourceName && sources.get(selectedSourceName)) || {
        sourcePageUrl: "",
        sourceName: "",
        sourceDescription: "",
        licensePageUrl: "",
      }
    );
  };

  const handleClick = useCallback(() => {
    selectedSourceName && agreeLicense(selectedSourceName);
  }, [selectedSourceName]);

  return (
    <>
      <Box>
        <FormControl
          sx={{ margin: 1, width: "98%", alignSelf: "center" }}
          size="medium"
        >
          <InputLabel id={"source-select-label"}>Source</InputLabel>
          <Select
            id={"source-select"}
            value={selectedSourceName || ""}
            label={"Source"}
            onChange={(event) => {
              setSelectedSourceName(event.target.value as string);
            }}
          >
            {sourceNameArray.map((sourceName, index) => (
              <MenuItem key={index} value={sourceName}>
                {sources.get(sourceName)?.sourceName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Alert severity="info">
        <Typography variant="h5" gutterBottom>
          <Link to={getEntry().sourcePageUrl} target="_blank" rel="noreferrer">
            {getEntry().sourceName}
          </Link>
        </Typography>
        {getEntry().sourceDescription}
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px",
          }}
        >
          <Button size={"large"} variant={"contained"} onClick={handleClick}>
            <a
              style={{ textDecoration: "none", color: "white" }}
              href={getEntry().licensePageUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open the license document
              <InlineIcon>
                <Launch />
              </InlineIcon>
            </a>
          </Button>
        </Box>
      </Alert>
    </>
  );
};
export const GADMSourcePanel = memo(GADMSourcePanelCore);
