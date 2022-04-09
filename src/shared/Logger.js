let logLevelColors = {
    'debug': '\x1b[36m',
    'info': '\x1b[32m',
    'warn': '\x1b[33m',
    'error': '\x1b[31m',
    'fatal': '\x1b[31m',
    'reset': '\x1b[0m'
};

class Logger {
    constructor (id, color) {
        this.id = id;
        this.color = color || '\x1b[36m';
    }

    log(...args) {
        console.log(`[${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    warn(...args) {
        console.log(`[${logLevelColors['warn']}WARN${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    error(...args) {
        console.log(`[${logLevelColors['error']}ERROR${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    fatal(...args) {
        console.log(`[${logLevelColors['fatal']}FATAL${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    debug(...args) {
        console.log(`[${logLevelColors['debug']}DEBUG${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }
}

module.exports = {
    Logger
}
