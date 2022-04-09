require('dotenv').config();

const { Logger } = require('../shared/Logger');
const Client = require('./Client');

const MPH_MPPCLONE_TOKEN = process.env.MPH_MPPCLONE_TOKEN;

class ClientManager {
    static logger = new Logger('ClientManager', '\x1b[34m');
    // TODO mpp client handler
    // TODO mppclone custom messages

    static clients = [];

    /**
     * Initialize the client manager
     */
    static async start() {
        this.logger.log('Starting client manager...');
        await this.initClients();
        process.send('ready');
    }

    /**
     * Stop the client manager
     */
    static async stop() {
        this.logger.log('Stopping client manager...');
    }

    static async initClients() {
        let connections = require('./ConnectionList');

        for (let uri of Object.keys(connections)) {
            for (let channel of connections[uri]) {
                let client = new Client(uri, MPH_MPPCLONE_TOKEN);
                client.start();
                client.setChannel(channel._id);
                this.clients.push(client);
            }
        }
    }
}

ClientManager.start();

process.on('SIGINT', async (sig) => {
    await ClientManager.stop();
    process.exit();
});

module.exports = {
    ClientManager
}
