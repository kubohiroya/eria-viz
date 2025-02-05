import React, { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { memo } from "react";
import {
  Autocomplete,
  type AutocompleteChangeDetails,
  type AutocompleteInputChangeReason,
  Box,
  TextField,
} from "@mui/material";
import { FiberNew } from "@mui/icons-material";
import { type StorageBundlesPanelProps } from "./StorageBundlesPanelProps";
import { useStorageBundlesContext } from "../../hooks/useStorageBundlesContext";

const StorageBundlesPanelCore = ({
  children,
  label,
  onStorageBundleSelected,
}: StorageBundlesPanelProps) => {
  const storageContext = useStorageBundlesContext();

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
