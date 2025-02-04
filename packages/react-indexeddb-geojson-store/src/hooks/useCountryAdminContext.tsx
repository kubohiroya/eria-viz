import React, {
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useGeoJsonCountryMetadataContext } from "./useGeoJsonCountryMetadata";
import { CountryMetadata } from "../types/CountryMetadata";

type CountryAdminContextValue = {
  selectCheckboxMatrix: boolean[][];
  setSelectCheckboxMatrix: (matrix: boolean[][]) => void;
  selectedCount: number;
  setSelectedCount: (count: number) => void;
};

const defaultCountryAdminContextValue: CountryAdminContextValue = {
  selectCheckboxMatrix: [],
  setSelectCheckboxMatrix: () => {},
  selectedCount: 0,
  setSelectedCount: () => {},
};

export const CountryAdminContext =
  React.createContext<CountryAdminContextValue>(
    defaultCountryAdminContextValue,
  );

export const CountryAdminContextProvider = ({
                                                children,
                                            }: {
    children: ReactNode;
}) => {
    const [selectCheckboxMatrix, setSelectCheckboxMatrix] = useState<boolean[][]>(
      defaultCountryAdminContextValue.selectCheckboxMatrix,
    );
  const [selectedCount, setSelectedCount] = useState<number>(
    defaultCountryAdminContextValue.selectedCount,
  );

  const countryMetadataContext = useGeoJsonCountryMetadataContext();

    useEffect(() => {
      if(countryMetadataContext.countryMetadataArray.length === 0){
          return;
      }
        const checkboxMatrix = countryMetadataContext.countryMetadataArray.map(
          (countryMetadata: CountryMetadata) =>
            new Array<boolean>(countryMetadata.numAdminLevels),
        );
        setSelectCheckboxMatrix(checkboxMatrix);
  }, [countryMetadataContext.countryMetadataArray]);

  return (
    <CountryAdminContext.Provider
      value={{
        selectCheckboxMatrix,
        setSelectCheckboxMatrix,
        selectedCount,
        setSelectedCount,
      }}
    >
      {children}
    </CountryAdminContext.Provider>
  );
};

export const useCountryAdminContext = (): CountryAdminContextValue => {
  return useContext(CountryAdminContext);
};
