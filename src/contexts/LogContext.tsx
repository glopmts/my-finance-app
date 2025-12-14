import { useLogger } from "@/hooks/useLogger";
import React, { createContext, ReactNode, useContext } from "react";

interface LogContextType {
  logs: ReturnType<typeof useLogger>["logs"];
  info: (
    message: string,
    source: string,
    details?: Record<string, any>
  ) => void;
  warn: (
    message: string,
    source: string,
    details?: Record<string, any>
  ) => void;
  error: (
    message: string,
    source: string,
    details?: Record<string, any>
  ) => void;
  debug: (
    message: string,
    source: string,
    details?: Record<string, any>
  ) => void;
  clearAllLogs: () => void;
  getStats: () => {
    total: number;
    info: number;
    warn: number;
    error: number;
    debug: number;
  };
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const logger = useLogger();

  return <LogContext.Provider value={logger}>{children}</LogContext.Provider>;
}

export function useLog() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
}
