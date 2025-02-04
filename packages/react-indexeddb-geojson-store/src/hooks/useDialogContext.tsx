import React, { useContext, useState } from "react";
import { ReactNode } from "react";

type DialogContextValue = {
  currentStepIndex: number;
  setCurrentStepIndex: (currentStepIndex: number) => void;
  completedStepIndex: number;
  setCompletedStepIndex: (completedStepIndex: number) => void;
  isNextButtonEnabled: boolean;
  setNextButtonEnabled: (isNextButtonEnabled: boolean) => void;
  footer: ReactNode;
  setFooter: (footer: ReactNode) => void;
};

const defaultDialogContextValue: DialogContextValue = {
  currentStepIndex: 0,
  setCurrentStepIndex: (currentStepIndex: number) => {},
  completedStepIndex: -1,
  setCompletedStepIndex: (completedStepIndex: number) => {},
  isNextButtonEnabled: false,
  setNextButtonEnabled: (isNextButtonEnabled: boolean) => {},
  footer: null,
  setFooter: (footer: ReactNode) => {},
};

const DialogContext = React.createContext<DialogContextValue>(
  defaultDialogContextValue,
);

export const DialogContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(
    defaultDialogContextValue.currentStepIndex,
  );
  const [completedStepIndex, setCompletedStepIndex] = useState<number>(
    defaultDialogContextValue.completedStepIndex,
  );
  const [isNextButtonEnabled, setNextButtonEnabled] = useState<boolean>(
    defaultDialogContextValue.isNextButtonEnabled,
  );
  const [footer, setFooter] = useState<ReactNode>(
    defaultDialogContextValue.footer,
  );

  return (
    <DialogContext.Provider
      value={{
        currentStepIndex,
        setCurrentStepIndex,
        completedStepIndex,
        setCompletedStepIndex,
        isNextButtonEnabled,
        setNextButtonEnabled,
        footer,
        setFooter,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogContext = (): DialogContextValue => {
  return useContext(DialogContext);
};
