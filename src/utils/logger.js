/**
 * AI-AutoCoding-DAO Logger
 * Simple logging utility for the AI-AutoCoding-DAO system
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default configuration
const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  enableConsole: true,
  enableFile: false,
  logFilePath: './logs/aiacd.log'
};

/**
 * Get numeric log level from string
 * @param {string} level - Log level string
 * @returns {number} Numeric log level
 */
function getLogLevel(level) {
  if (!level) return LOG_LEVELS.INFO;
  
  const normalizedLevel = level.toLowerCase();
  
  switch (normalizedLevel) {
    case 'debug':
      return LOG_LEVELS.DEBUG;
    case 'info':
      return LOG_LEVELS.INFO;
    case 'warn':
    case 'warning':
      return LOG_LEVELS.WARN;
    case 'error':
      return LOG_LEVELS.ERROR;
    case 'none':
    case 'off':
      return LOG_LEVELS.NONE;
    default:
      return LOG_LEVELS.INFO;
  }
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string} Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      try {
        logMessage += ` - ${JSON.stringify(data)}`;
      } catch (e) {
        logMessage += ` - [Object]`;
      }
    } else {
      logMessage += ` - ${data}`;
    }
  }
  
  return logMessage;
}

/**
 * Log message to console
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function logToConsole(level, message, data) {
  const logMessage = formatLog(level, message, data);
  
  switch (level.toLowerCase()) {
    case 'debug':
      console.debug(logMessage);
      break;
    case 'info':
      console.info(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'error':
      console.error(logMessage);
      break;
    default:
      console.log(logMessage);
  }
}

/**
 * Log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function log(level, message, data) {
  const currentLevel = getLogLevel(config.logLevel);
  const messageLevel = getLogLevel(level);
  
  if (messageLevel < currentLevel) {
    return;
  }
  
  if (config.enableConsole) {
    logToConsole(level, message, data);
  }
  
  // File logging implementation can be added here
}

// Logger API
const logger = {
  /**
   * Configure logger
   * @param {Object} options - Logger configuration
   */
  configure(options) {
    Object.assign(config, options);
  },
  
  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...config };
  },
  
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  debug(message, data) {
    log('debug', message, data);
  },
  
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data) {
    log('info', message, data);
  },
  
  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data) {
    log('warn', message, data);
  },
  
  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  error(message, data) {
    log('error', message, data);
  }
};

module.exports = logger;
