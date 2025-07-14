const log4js = require('log4js');
const { existsSync, mkdirSync } = require('fs');
const path = require('path');

module.exports = function (app, config) {
    const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
    global.LOG_LEVEL = LOG_LEVEL;
    const LOGGER_NAME = `[${process.env.NAME}:${process.env.VERSION}]`;
    global.loggerName = LOGGER_NAME;

    // Ensure logs directory exists
    const LOGS_DIR = path.resolve('./logs');
    if (!existsSync(LOGS_DIR)) {
        mkdirSync(LOGS_DIR, { recursive: true });
    }

    log4js.configure({
        appenders: {
            out: { type: 'stdout', layout: { type: 'basic' } },
            file: {
                type: 'dateFile',
                filename: path.join(LOGS_DIR, 'app.log'),
                pattern: 'yyyy-MM-dd',
                keepFileExt: true,
                numBackups: 7,
                layout: { type: 'basic' }
            }
        },
        categories: { default: { appenders: ['out', 'file'], level: LOG_LEVEL } },
        pm2: true
    });

    global.getLogger = (loggerName) => {
        loggerName = path.basename(loggerName, '.js');
        loggerName = loggerName.replace(/\./g, '-').toUpperCase();
        return log4js.getLogger(`[${loggerName}]`);
    };

    global.logger = log4js.getLogger(LOGGER_NAME);
    global.logger.info('Logger Initialized');

    // API Request Logger
    app.use(log4js.connectLogger(log4js.getLogger(global.loggerName), {
        level: 'info',
        format: ':method :status :url :remote-addr :response-time ms'
    }));
};