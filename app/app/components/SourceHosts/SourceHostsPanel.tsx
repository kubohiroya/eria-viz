import React, { useCallback, useEffect, useState } from "react";
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
import { InlineIcon } from "../InlineIcon/InlineIcon";
import { Launch } from "@mui/icons-material";
import { type SourceHostsPanelProps } from "./SourceHostsPanelProps";
import { Link } from "react-router";
import {
  type SourceHostMetadata,
  SourceHostNameArray,
  SourceHostNames,
  SourceHosts,
} from "../../types/SourceHosts";
import { useSourceHostsContext } from "../../hooks/useSourceHostsContext";

export const SourceHostsPanelCore = ({
  agreeLicense,
}: SourceHostsPanelProps) => {
  const sourceHostsContext = useSourceHostsContext();
  const [sourceHostName, setSourceHostName] = useState<string>(
    sourceHostsContext.sourceHostName,
  );

  const getEntry = useCallback((): SourceHostMetadata => {
    return (
      (sourceHostsContext.sourceHostName &&
        SourceHosts[sourceHostsContext.sourceHostName]) ||
      SourceHosts[SourceHostNames.GADM]
    );
  }, [sourceHostsContext.sourceHostName]);

  const handleSelectSourceHost = useCallback((event: any) => {
    const newSourceHostName = event.target.value as string;
    setSourceHostName(newSourceHostName);
    sourceHostsContext.setSourceHostName(newSourceHostName);
  }, []);

  const handleOpenLicensePage = useCallback(() => {
    sourceHostName && agreeLicense(sourceHostName);
  }, [sourceHostName]);

  useEffect(() => {
    setSourceHostName(sourceHostsContext.sourceHostName);
  }, []);

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
            value={sourceHostName}
            label={"Source"}
            onChange={handleSelectSourceHost}
          >
            {SourceHostNameArray.map((sourceName: string, index: number) => (
              <MenuItem key={index} value={sourceName}>
                {SourceHosts[sourceName]?.sourceHostName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Alert severity="info">
        <Typography variant="h5" gutterBottom>
          <Link
            to={getEntry().sourceHostPageUrl}
            target="_blank"
            rel="noreferrer"
          >
            {getEntry().sourceHostName}
          </Link>
        </Typography>
        {getEntry().sourceHostDescription}
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px",
          }}
        >
          <Button
            size={"large"}
            variant={"contained"}
            onClick={handleOpenLicensePage}
          >
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
export const SourceHostsPanel = memo(SourceHostsPanelCore);
