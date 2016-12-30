const { Logger, LEVELS } = require('../logger');
const assert = require('assert');
const sinon = require('sinon');

describe('Logger', function () {
  // beforeEach(function() {
  //   // mute console logs from interuputing test output
  //   console.log = {};
  // });

  describe('constructor', function () {
    it('should override the format and transport functions if provided in the config', function () {
      const formatFn = function () {
        return 'formatted!';
      };
      const transportFn = function() {
        return 'transported!';
      };

      const logger = new Logger({ format: formatFn, transport: transportFn });
      assert.equal(logger.format, formatFn);
      assert.equal(logger.transport, transportFn);
    });

    it('should NOT override the format and transport functions if provided values are not functions in the config', function () {
      const formatFn = 'something thats not a function';
      const transportFn = 42;

      const logger = new Logger({ format: formatFn, transport: transportFn });
      assert.notEqual(logger.format, formatFn);
      assert.notEqual(logger.transport, transportFn);
      assert.equal(typeof logger.format, 'function');
      assert.equal(typeof logger.transport, 'function');
    });
  });
  describe('log', function () {
    let logger;
    beforeEach(function() {
      logger = new Logger({
        // override the transport function for these tests
        // so testing output isn't interrupted
        transport: function() {}
      });
    });

    it('should call createLogObject with supplied data and level', function () {
      const spy = sinon.spy(logger, 'createLogObject');

      const logData = 'any data';

      logger.log(logData, LEVELS.DEBUG);

      sinon.assert.calledWith(spy, logData, LEVELS.DEBUG);
    });

    it('should call should call this.format with logObject generated from createLogObject', function () {
      const logObjReturn = {
        level: LEVELS.DEBUG,
        message: 'doesnt matter for this test',
      };

      const stubLogObj = sinon.stub(logger, 'createLogObject', function() {
        return logObjReturn;
      });

      const formatSpy = sinon.spy(logger, 'format');

      const logData = 'any data';

      logger.log(logData, LEVELS.DEBUG);

      sinon.assert.calledWith(formatSpy, logObjReturn);
    });

    it('should call transport with message generated from this.format', function () {
      const formatReturn = 'some string that has been formatted';

      const formatStub = sinon.stub(logger, 'format', function() {
        return formatReturn;
      });

      const transportSpy = sinon.spy(logger, 'transport');

      const logData = 'any data';

      logger.log(logData, LEVELS.DEBUG);

      sinon.assert.calledWith(transportSpy, LEVELS.DEBUG, formatReturn);
    });
  });

  describe('createLogObject', function () {
    it('should assign data to a message property of the logObj if data is a string', function () {
      const logger = new Logger({});
      const msgText = 'this is my message text';

      let logObj = logger.createLogObject(msgText, LEVELS.DEBUG);
      let expectedLogObj = {
        root: 'root',
        message: msgText,
        level: LEVELS.DEBUG,
      };
      assert.deepEqual(logObj, expectedLogObj);

      const nextMessage = { somekey: 'some value', anotherKey: 'anotherValue' };
      logObj = logger.createLogObject(nextMessage, LEVELS.DEBUG);
      expectedLogObj = Object.assign(nextMessage, {
        root: 'root',
        level: LEVELS.DEBUG,
      });
      assert.deepEqual(logObj, expectedLogObj);
    });

    it('should assign the level of `info` if none is provided', function () {
      const logger = new Logger({});
      const msgText = 'this is my message text';

      const logObj = logger.createLogObject(msgText);
      const expectedLogObj = {
        root: 'root',
        message: msgText,
        level: LEVELS.INFO,
      };
      assert.deepEqual(logObj, expectedLogObj);
    });
    
    it('should append a root property to the logObj if one is provided with the config', function () {
      const altRoot = 'someOtherRoot';
      const logger = new Logger({ root: altRoot });

      const logObj = logger.createLogObject('any msg text');
      assert.equal(logObj.root, altRoot);
    });
  });
  describe('format', function () {
    it('should add the appropriate color unicode to the begging and end of the formatted message', function() {
      const logger = new Logger({});

      let logObj = {
        level: LEVELS.ERROR,
        message: 'some error message',
      };

      // Ideally I would have spied on chalk.x functions, but couldn't
      // get it to work with the mocha framework
      const redUnicode = ['\u001b[31m', '\u001b[39m'];
      const yellowUnicode = ['\u001b[33m', '\u001b[39m'];
      const blueUnicode = ['\u001b[34m', '\u001b[39m'];
      const greenUnicode = ['\u001b[32m', '\u001b[39m'];


      let formattedResult = logger.format(logObj);
      assert.equal(formattedResult.startsWith(redUnicode[0]), true);
      assert.equal(formattedResult.endsWith(redUnicode[1]), true);

      logObj.level = LEVELS.WARN;
      formattedResult = logger.format(logObj);
      assert.equal(formattedResult.startsWith(yellowUnicode[0]), true);
      assert.equal(formattedResult.endsWith(yellowUnicode[1]), true);

      logObj.level = LEVELS.DEBUG;
      formattedResult = logger.format(logObj);
      assert.equal(formattedResult.startsWith(blueUnicode[0]), true);
      assert.equal(formattedResult.endsWith(blueUnicode[1]), true);

      logObj.level = 'anything else';
      formattedResult = logger.format(logObj);
      assert.equal(formattedResult.startsWith(greenUnicode[0]), true);
      assert.equal(formattedResult.endsWith(greenUnicode[1]), true);
    });
  });
  describe('transport', function () {
    it('should call console.log with the supplied message', function() {
      const logger = new Logger({});
      const outputMsg = 'some string that has been formatted';

      const consoleSpy = sinon.spy(console, 'log');

      logger.transport(LEVELS.DEBUG, outputMsg);

      sinon.assert.calledWith(consoleSpy, outputMsg);
    });
  });
});
