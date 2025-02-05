import { useCallback } from "react";
import { useNavigate } from "react-router";
import {APP_NAME, BASE } from "../config";
import { Box, Button } from "@mui/material";
import React from "react";

export default function()  {
  const navigate = useNavigate();
  const openDialog = useCallback(() => {
    navigate(`/${BASE}/${APP_NAME}`);
  }, []);

  return (
    <Box>
      <Button variant="contained" onClick={openDialog}>
        Open Dialog
      </Button>
    </Box>
  );
};

