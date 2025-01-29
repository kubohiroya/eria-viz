import React from "react";

export const DownloadingIcon = ({
                                    state,
                                }: {
    state: DownloadStatus | number | undefined;
}) => {
    if (state === undefined) {
        return null;
    }

    switch (state) {
        case DownloadStatus.NonTarget:
            return <Typography color={"lightGray"}>-</Typography>;
        case DownloadStatus.Initialized:
            return <CircularProgress size={14} style={{"color": "lightGray", marginTop: 5}}/>;
        case DownloadStatus.Finished:
            return <DownloadDone/>;
        case DownloadStatus.Downloading:
        default:
            return <CircularProgress size={14} value={state}/>;
    }
};