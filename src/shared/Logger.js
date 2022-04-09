let logLevelColors = {
    'debug': '\x1b[36m',
    'info': '\x1b[32m',
    'warn': '\x1b[33m',
    'error': '\x1b[31m',
    'fatal': '\x1b[31m',
    'reset': '\x1b[0m',
    'time': '\x1b[32m'
};

class Logger {
    constructor (id, color) {
        this.id = id;
        this.color = color || '\x1b[36m';
    }

    static getHHMMSS() {
        let date = new Date();
        let hh = date.getHours();
        let mm = date.getMinutes();
        let ss = date.getSeconds();
        return `${logLevelColors['time']}${(hh < 10 ? '0' : '') + hh}:${(mm < 10 ? '0' : '') + mm}:${(ss < 10 ? '0' : '') + ss}${logLevelColors['reset']}`;
    }

    log(...args) {
        console.log(`${Logger.getHHMMSS()} [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    warn(...args) {
        console.log(`${Logger.getHHMMSS()} [${logLevelColors['warn']}WARN${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    error(...args) {
        console.log(`${Logger.getHHMMSS()} [${logLevelColors['error']}ERROR${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    fatal(...args) {
        console.log(`${Logger.getHHMMSS()} [${logLevelColors['fatal']}FATAL${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }

    debug(...args) {
        console.log(`${Logger.getHHMMSS()} [${logLevelColors['debug']}DEBUG${logLevelColors['reset']}] [${this.color}${this.id}${logLevelColors['reset']}]`, ...args);
    }
}

module.exports = {
    Logger
}
