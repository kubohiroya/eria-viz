import React, {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCountryMetadataContext } from "./useCountryMetadata";
import { type CountryMetadata } from "../types/CountryMetadata";

type CountryAdminContextValue = {
  selectCheckboxMatrix: boolean[][];
  handleSelectCheckboxMatrix: (matrix: boolean[][]) => void;
  selectedCount: number;
  setSelectedCount: (count: number) => void;
};

const defaultCountryAdminContextValue: CountryAdminContextValue = {
  selectCheckboxMatrix: [],
  handleSelectCheckboxMatrix: () => {},
  selectedCount: 0,
  setSelectedCount: () => {},
};

export const CountryAdminContext =
  React.createContext<CountryAdminContextValue>(
    defaultCountryAdminContextValue,
  );

export const CountryAdminsContextProvider = ({
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

  const handleSelectCheckboxMatrix = useCallback((
    matrix: boolean[][],
  ) => {
    setSelectCheckboxMatrix(matrix);
  }, []);

  const countryMetadataContext = useCountryMetadataContext();

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
        handleSelectCheckboxMatrix,
        selectedCount,
        setSelectedCount,
      }}
    >
      {children}
    </CountryAdminContext.Provider>
  );
};

export const useCountryAdminsContext = (): CountryAdminContextValue => {
  return useContext(CountryAdminContext);
};
