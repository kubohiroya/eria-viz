import React, { SyntheticEvent, useCallback } from "react";
import { memo } from "react";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { FiberNew } from "@mui/icons-material";
import { GADMStoragePanelProps } from "./GADMStoragePanelProps";

const GADMStoragePanelCore = ({
  children,
  databaseNames,
  databaseName,
  handleDatabaseNameChange,
}: GADMStoragePanelProps) => {
  const handleChange = useCallback(
    (
      event: SyntheticEvent<Element, Event>,
      databaseName: string | null,
      reason: AutocompleteChangeReason,
      details?: AutocompleteChangeDetails<string> | undefined,
    ) => {
      databaseName && handleDatabaseNameChange(databaseName);
    },
    [],
  );

  return (
    <>
      {children}
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "20px",
        }}
      >
        <Autocomplete
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          freeSolo
          disablePortal
          options={databaseNames}
          value={databaseName}
          onChange={handleChange}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Storage Name" />
          )}
        />
        <Box style={{ alignContent: "center" }}>
          {databaseName !== "" && !databaseNames.includes(databaseName) && (
            <FiberNew />
          )}
        </Box>
      </Box>
    </>
  );
};
export const GADMStoragePanel = memo(GADMStoragePanelCore);
