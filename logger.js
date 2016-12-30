const chalk = require('chalk');

const LEVELS = {
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'error',
  DEBUG: 'debug',
};

const Logger = function logger(config) {
  this.root = config.root || 'root';

  if (config.format && typeof config.format === 'function') {
    this.format = config.format;
  }

  if (config.transport && typeof config.transport === 'function') {
    this.transport = config.transport;
  }
};

Logger.prototype = {
  log(data, level) {
    const logObj = this.createLogObject(data, level);
    const formattedMsg = this.format(logObj);

    this.transport(level, formattedMsg);
  },

  createLogObject(data, level) {
    let rootObj;

    if (this.root) {
      rootObj = { root: this.root };
    }

    const logData = (typeof data === 'string') ? { message: data } : data;

    const logObj = Object.assign(rootObj, logData, { level: level || 'info' });

    return logObj;
  },

  format(logObj) {
    let colorMessage = {};
    const textMessage = JSON.stringify(logObj);

    switch (logObj.level) {
      case LEVELS.ERROR:
        colorMessage = chalk.red(textMessage);
        break;
      case LEVELS.WARN:
        colorMessage = chalk.yellow(textMessage);
        break;
      case LEVELS.DEBUG:
        colorMessage = chalk.blue(textMessage);
        break;
      default:
        colorMessage = chalk.green(textMessage);
    }

    return colorMessage;
  },

  transport(level, message) {
    console.log(message);
  },
};

module.exports = { Logger, LEVELS };
