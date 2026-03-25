import { createContext, useContext, useRef } from "react";

export interface FormFillers {
  setCropType: (v: string) => void;
  setQuantity: (v: string) => void;
  setPickup: (v: string) => void;
  setDrop: (v: string) => void;
}

interface VoiceCommandContextValue {
  registerFormFillers: (fillers: FormFillers | null) => void;
  getFormFillers: () => FormFillers | null;
}

const VoiceCommandContext = createContext<VoiceCommandContextValue | null>(
  null,
);

export function VoiceCommandProvider({
  children,
}: { children: React.ReactNode }) {
  const fillersRef = useRef<FormFillers | null>(null);

  const registerFormFillers = (fillers: FormFillers | null) => {
    fillersRef.current = fillers;
  };

  const getFormFillers = () => fillersRef.current;

  return (
    <VoiceCommandContext.Provider
      value={{ registerFormFillers, getFormFillers }}
    >
      {children}
    </VoiceCommandContext.Provider>
  );
}

export function useVoiceCommand() {
  const ctx = useContext(VoiceCommandContext);
  if (!ctx)
    throw new Error("useVoiceCommand must be used within VoiceCommandProvider");
  return ctx;
}
