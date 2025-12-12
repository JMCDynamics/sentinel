import React, { createContext, useContext, useEffect, useState } from "react";

type SensitiveInfoContextType = {
  showSensitiveInfo: boolean;
  toggleSensitiveInfo: () => void;
  setShowSensitiveInfo: (value: boolean) => void;
};

const SensitiveInfoContext = createContext<
  SensitiveInfoContextType | undefined
>(undefined);

export function SensitiveInfoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(() => {
    return localStorage.getItem("showSensitiveInfo") === "true";
  });

  useEffect(() => {
    localStorage.setItem("showSensitiveInfo", String(showSensitiveInfo));
  }, [showSensitiveInfo]);

  const toggleSensitiveInfo = () => {
    setShowSensitiveInfo((prev) => !prev);
  };

  return React.createElement(
    SensitiveInfoContext.Provider,
    {
      value: {
        showSensitiveInfo,
        toggleSensitiveInfo,
        setShowSensitiveInfo,
      },
    },
    children
  );
}

export function useSensitiveInfo() {
  const context = useContext(SensitiveInfoContext);

  if (!context) {
    throw new Error(
      "useSensitiveInfo must be used within a SensitiveInfoProvider"
    );
  }

  return context;
}
