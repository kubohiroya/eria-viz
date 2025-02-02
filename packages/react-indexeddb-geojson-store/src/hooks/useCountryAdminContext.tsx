import React, {ReactNode, useContext, useEffect, useRef } from "react";
import { useGeoJsonServiceContext } from "./useGeoJsonServiceContext";

type CountryAdminContextValue = {
    // TODO
}

const defaultCountryAdminContextValue: CountryAdminContextValue = {
    // TODO
};

export const CountryAdminContext = React.createContext<CountryAdminContextValue>(defaultCountryAdminContextValue);

export const CountryAdminContextProvider = ({
                                                children
                                            }:{
    children: ReactNode
})=>{

    // TODO

    const geoJsonService = useGeoJsonServiceContext();

    useEffect(() => {
        (async()=>{
        })()
    }, []);

    useEffect(()=>{
        (async()=>{
            if (!geoJsonService) {
                throw new Error("geoJsonService is not initialized");
            }
        })();
    }, []);

    return <CountryAdminContext.Provider value={{}}>{children}</CountryAdminContext.Provider>
}

export const useCountryAdminContext = (): CountryAdminContextValue =>{
    return useContext(CountryAdminContext);
}