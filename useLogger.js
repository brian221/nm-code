const fs = require('fs');
const yaml = require('js-yaml');
const { Logger, LEVELS } = require('./logger');

const rootLogger = new Logger({ root: 'driver' });

rootLogger.log({ message: 'starting the app' });

rootLogger.log('an error occured', LEVELS.ERROR);

// transport is an overridable method that outputs the log.  By default it just logs to the console.
// In this instance it is being used to write to a file based on the current level being logged.
const fileLogger = new Logger({
  transport(level, message) {
    const fMessage = `${message} \n`;
    fs.appendFile(`out/${level}.log`, fMessage, (err) => {
      if (err) throw err;
    });
  },
});

fileLogger.log({ cwd: __dirname }, LEVELS.DEBUG);

// format is an overridable function that takes an object and returns a string that gets written.
// By default it jsonifies the passed in object.  In this case it outputs yaml string.
const yamlLogger = new Logger({
  format(logObj) {
    return yaml.safeDump(logObj);
  },
});

yamlLogger.log('This is some yaml');
