import { LogEntry, logger } from "@/utils/logger";
import { useEffect, useState } from "react";

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>(logger.getAllLogs());

  useEffect(() => {
    const unsubscribe = logger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return unsubscribe;
  }, []);

  const methods = {
    info: (message: string, source: string, details?: Record<string, any>) => {
      return logger.info(message, source, details);
    },
    warn: (message: string, source: string, details?: Record<string, any>) => {
      return logger.warn(message, source, details);
    },
    error: (message: string, source: string, details?: Record<string, any>) => {
      return logger.error(message, source, details);
    },
    debug: (message: string, source: string, details?: Record<string, any>) => {
      return logger.debug(message, source, details);
    },

    getAllLogs: () => logs,
    clearAllLogs: () => logger.clearAllLogs(),
    searchLogs: (query: string) => logger.searchLogs(query),
    exportAsJSON: () => logger.exportAsJSON(),
    exportAsText: () => logger.exportAsText(),

    getStats: () => {
      return {
        total: logs.length,
        info: logs.filter((log) => log.level === "info").length,
        warn: logs.filter((log) => log.level === "warn").length,
        error: logs.filter((log) => log.level === "error").length,
        debug: logs.filter((log) => log.level === "debug").length,
      };
    },
  };

  return {
    logs,
    ...methods,
  };
}
