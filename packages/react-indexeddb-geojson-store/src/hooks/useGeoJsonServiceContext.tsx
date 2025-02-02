import { GeoJsonService } from "../services/GeoJsonService";
import {ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useStorageBundleContext } from "./useStorageBundleContext";
import { useParams } from "react-router";

type GeoJsonServiceContextValue = {
    geoJsonService: GeoJsonService|undefined
};

const defaultGeoJsonServiceContext: GeoJsonServiceContextValue = {
    geoJsonService: undefined
};


export const GeoJsonServiceContext = React.createContext<GeoJsonServiceContextValue>(defaultGeoJsonServiceContext);

export const GeoJsonServiceContextProvider = ({children}: {children: ReactNode})=>{
    const {storageBundleName} = useParams();
    const storageBundleContext = useStorageBundleContext();

    const [geoJsonService, setGeoJsonService] = useState<GeoJsonService>();

    useEffect(()=>{
        if(storageBundleName && storageBundleName.length > 0){
            storageBundleContext.setStorageBundleName(storageBundleName);
            (async()=>{
                setGeoJsonService(await GeoJsonService.createInstance(storageBundleName));
            })();
        }
    },[storageBundleName]);

    return <GeoJsonServiceContext.Provider value={{
        geoJsonService
    }}>{children}</GeoJsonServiceContext.Provider>;
}

export const useGeoJsonServiceContext = (): GeoJsonServiceContextValue =>{
    return useContext(GeoJsonServiceContext);
}

