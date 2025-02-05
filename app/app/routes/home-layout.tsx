import React from "react";
import GitHubCorner from "../components/GitHubCorner/GitHubCorner";
import { GITHUB_PAGES_URL } from "../config";
import Typography from "@mui/material/Typography";
import { Outlet } from "react-router";
import { Stack } from "@mui/material";

export default function HomeLayout(){
  return (
    <>
      <GitHubCorner url={GITHUB_PAGES_URL}/>
      <Stack alignSelf={"center"} alignItems={"center"} justifyContent={"center"} spacing={10}>
        <Typography variant={"h3"}>Shape File Select Downloader</Typography>
        <Outlet/>
      </Stack>
    </>
  );

}
