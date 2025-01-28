import React from 'react';
import {GeoDBMapViewer} from "./GeoDBMapViewer";
import {useState} from "react";

export const Index = ()=> {
    const [databaseName, setDatabaseName] = useState("test");
    return (
        <>
            <GeoDBMapViewer databaseName={databaseName}
            style={{width: "100%", height: "100vh"}}
            />
        </>

    );
};

export {GeoDBMapViewer} from './GeoDBMapViewer'
