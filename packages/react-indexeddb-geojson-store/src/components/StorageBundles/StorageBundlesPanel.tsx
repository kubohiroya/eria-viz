import React, { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { memo } from "react";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteInputChangeReason,
  Box,
  TextField,
} from "@mui/material";
import { FiberNew } from "@mui/icons-material";
import { StorageBundlesPanelProps } from "./StorageBundlesPanelProps";
import { useStorageBundleContext } from "../../hooks/useStorageBundleContext";

const StorageBundlesPanelCore = ({
  children,
  label,
  onStorageBundleSelected,
}: StorageBundlesPanelProps) => {
  const storageContext = useStorageBundleContext();

  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);

  const handleChange = useCallback(
    (
      event: SyntheticEvent<Element, Event>,
      value: string,
      reason: AutocompleteInputChangeReason,
      details?: AutocompleteChangeDetails<string>,
    ) => {
      setValue(value);
    },
    [],
  );

  const handleInput = useCallback((event: SyntheticEvent<Element, Event>) => {
    setValue((event.target as HTMLInputElement).value);
  }, []);

  const handleBlur = useCallback(() => {
    storageContext.setStorageBundleName(value);
    onStorageBundleSelected(value);
  }, [value]);

  useEffect(() => {
    if (storageContext.storageBundleName) {
      setValue(storageContext.storageBundleName);
    }
    if (storageContext.storageBundleNames) {
      setOptions(storageContext.storageBundleNames);
    }
  }, [
    storageContext,
    storageContext.storageBundleNames,
    storageContext.storageBundleName,
  ]);

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
          handleHomeEndKeys
          freeSolo
          disablePortal
          options={options}
          inputValue={value}
          onInputChange={handleChange}
          onInput={handleInput}
          onBlur={handleBlur}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label={label} />}
        />
        <Box style={{ alignContent: "center" }}>
          {value !== "" &&
            !storageContext.storageBundleNames.includes(value) && <FiberNew />}
        </Box>
      </Box>
    </>
  );
};
export const StorageBundlesPanel = memo(StorageBundlesPanelCore);
