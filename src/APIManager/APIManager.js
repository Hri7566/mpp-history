const { EventEmitter } = require('events');

const { Logger } = require('../shared/Logger');
const { WebRequestServer } = require('./WebRequestServer');

class APIManager {
    // TODO API manager

    /**
     * Context logger
     */
    static logger = new Logger('API', '\x1b[34m');

    /**
     * EventEmitter methods
     */
    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static once = EventEmitter.prototype.once;
    static emit = EventEmitter.prototype.emit;

    /**
     * Initialize the API manager
     */
    static async start() {
        this.logger.log('Starting API manager...');
        await WebRequestServer.start();
        this.sendMessage({
            m: 'ready'
        });
    }

    /**
     * Stop the API manager
     */
    static async stop() {
        this.logger.log('Stopping API manager...');
    }

    /**
     * Send a message to the server
     * @param {object} msg Message object
     */
    static sendMessage(msg) {
        process.send(JSON.stringify(msg));
    }
}

APIManager.start();

process.on('SIGINT', async (sig) => {
    await APIManager.stop();
    process.exit();
});

process.on('message', async (msg) => {
    await APIManager.receiveServerMessage(msg);
});

module.exports = {
    APIManager
}
