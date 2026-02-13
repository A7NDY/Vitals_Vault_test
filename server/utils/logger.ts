import fs from "fs";
import path from "path";

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  category: string;
  message: string;
  userId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

const LOG_DIR = process.env.LOG_DIR || "./logs";
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const LOG_FILE = path.join(LOG_DIR, "vitals-sync.log");
const SECURITY_LOG_FILE = path.join(LOG_DIR, "security.log");

/**
 * Ensures log directory exists
 */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Rotates log file if it exceeds max size
 */
function rotateLogIfNeeded(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) return;

    const stats = fs.statSync(filePath);
    if (stats.size > MAX_LOG_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = filePath.replace(".log", `.${timestamp}.log`);
      fs.renameSync(filePath, backupPath);
    }
  } catch (error) {
    console.error("Log rotation failed:", error);
  }
}

/**
 * Formats log entry for file storage
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    category: entry.category,
    message: entry.message,
    userId: entry.userId,
    action: entry.action,
    details: entry.details,
    ipAddress: entry.ipAddress,
  });
}

/**
 * Core logging function
 */
function writeLog(entry: LogEntry, filePath: string): void {
  try {
    ensureLogDir();
    rotateLogIfNeeded(filePath);

    const logLine = formatLogEntry(entry) + "\n";
    fs.appendFileSync(filePath, logLine, { encoding: "utf8" });

    // Also log to console in development
    if (process.env.NODE_ENV !== "production") {
      const prefix = `[${entry.level}] [${entry.category}]`;
      console.log(`${prefix} ${entry.message}`);
    }
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}

/**
 * Log vitals sync activity
 */
export function logVitalsSyncActivity(
  userId: string,
  action: string,
  status: "success" | "failure",
  details?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: status === "success" ? "INFO" : "ERROR",
    category: "VITALS_SYNC",
    message: `Vitals sync ${status}: ${action}`,
    userId,
    action,
    details: {
      status,
      ...details,
    },
  };

  writeLog(entry, LOG_FILE);
}

/**
 * Log token refresh activity
 */
export function logTokenRefresh(
  userId: string,
  provider: string,
  success: boolean,
  error?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: success ? "INFO" : "WARNING",
    category: "TOKEN_REFRESH",
    message: `Token refresh for ${provider}: ${success ? "success" : "failed"}`,
    userId,
    action: "TOKEN_REFRESH",
    details: {
      provider,
      success,
      error,
    },
  };

  writeLog(entry, SECURITY_LOG_FILE);
}

/**
 * Log authentication events
 */
export function logAuthEvent(
  userId: string,
  eventType: "connect" | "disconnect" | "authorize",
  provider: string,
  success: boolean,
  ipAddress?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: success ? "INFO" : "WARNING",
    category: "AUTHENTICATION",
    message: `${provider} ${eventType}: ${success ? "success" : "failed"}`,
    userId,
    action: eventType.toUpperCase(),
    details: {
      provider,
      success,
    },
    ipAddress,
  };

  writeLog(entry, SECURITY_LOG_FILE);
}

/**
 * Log access control events
 */
export function logAccessEvent(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  ipAddress?: string
): void {
  const level = statusCode >= 400 ? "WARNING" : "INFO";
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category: "ACCESS_CONTROL",
    message: `${method} ${endpoint} returned ${statusCode}`,
    userId,
    action: "API_REQUEST",
    details: {
      endpoint,
      method,
      statusCode,
    },
    ipAddress,
  };

  writeLog(entry, SECURITY_LOG_FILE);
}

/**
 * Log encryption/decryption events
 */
export function logEncryptionEvent(
  operation: "encrypt" | "decrypt",
  success: boolean,
  dataType: string,
  error?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: success ? "DEBUG" : "ERROR",
    category: "ENCRYPTION",
    message: `${operation} ${dataType}: ${success ? "success" : "failed"}`,
    action: operation.toUpperCase(),
    details: {
      dataType,
      success,
      error,
    },
  };

  writeLog(entry, SECURITY_LOG_FILE);
}

/**
 * Retrieve recent logs (for monitoring)
 */
export function getRecentLogs(
  filePath: string,
  lines: number = 100
): LogEntry[] {
  try {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, "utf8");
    const logLines = content.split("\n").filter((line) => line.trim());

    return logLines
      .slice(-lines)
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is LogEntry => entry !== null);
  } catch (error) {
    console.error("Failed to read logs:", error);
    return [];
  }
}

/**
 * Get recent vitals sync logs
 */
export function getVitalsSyncLogs(lines: number = 50): LogEntry[] {
  return getRecentLogs(LOG_FILE, lines);
}

/**
 * Get recent security logs
 */
export function getSecurityLogs(lines: number = 100): LogEntry[] {
  return getRecentLogs(SECURITY_LOG_FILE, lines);
}

export default {
  logVitalsSyncActivity,
  logTokenRefresh,
  logAuthEvent,
  logAccessEvent,
  logEncryptionEvent,
  getVitalsSyncLogs,
  getSecurityLogs,
};
