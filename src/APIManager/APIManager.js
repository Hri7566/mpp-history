const { Logger } = require('../shared/Logger');

class APIManager {
    // TODO API manager

    static logger = new Logger('API', '\x1b[34m');

    /**
     * Initialize the API manager
     */
    static async start() {
        this.logger.log('Starting API manager...');
        process.send('ready');
    }

    /**
     * Stop the API manager
     */
    static async stop() {
        this.logger.log('Stopping API manager...');
    }
}

APIManager.start();

process.on('SIGINT', async (sig) => {
    await APIManager.stop();
    process.exit();
});

module.exports = {
    APIManager
}
