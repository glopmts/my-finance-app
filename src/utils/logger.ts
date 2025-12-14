export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source: string;
  details?: Record<string, any>;
  userId?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private subscribers: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.log("info", "Sistema de logs inicializado", "LoggerService", {
      version: "1.0.0",
      platform: typeof window !== "undefined" ? "web" : "mobile",
    });
  }

  log(
    level: LogLevel,
    message: string,
    source: string,
    details?: Record<string, any>
  ) {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
      source,
      details,
    };

    this.logs.unshift(newLog);

    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    console.log(
      `[${level.toUpperCase()}] ${source}: ${message}`,
      details || ""
    );

    this.notifySubscribers();

    return newLog;
  }

  // Métodos helper para cada nível
  info(message: string, source: string, details?: Record<string, any>) {
    return this.log("info", message, source, details);
  }

  warn(message: string, source: string, details?: Record<string, any>) {
    return this.log("warn", message, source, details);
  }

  error(message: string, source: string, details?: Record<string, any>) {
    return this.log("error", message, source, details);
  }

  debug(message: string, source: string, details?: Record<string, any>) {
    return this.log("debug", message, source, details);
  }

  // Getters
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter((log) => log.source.includes(source));
  }

  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerQuery) ||
        log.source.toLowerCase().includes(lowerQuery) ||
        (log.details &&
          JSON.stringify(log.details).toLowerCase().includes(lowerQuery))
    );
  }

  clearAllLogs(): void {
    this.logs = [];
    this.notifySubscribers();
    this.info("Logs limpos", "LoggerService");
  }

  clearLogsByLevel(level: LogLevel): void {
    this.logs = this.logs.filter((log) => log.level !== level);
    this.notifySubscribers();
    this.info(`Logs do nível ${level} limpos`, "LoggerService");
  }

  subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    const logsCopy = [...this.logs];
    this.subscribers.forEach((callback) => callback(logsCopy));
  }

  exportAsJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  exportAsText(): string {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message} (${log.source})`
      )
      .join("\n");
  }
}

export const logger = new LoggerService();
