require('dotenv').config();

const { Logger } = require('../shared/Logger');
const { Prefix } = require('./Prefix');
const { CommandHandler } = require('../shared/CommandHandler');
const Client = require('./Client');

const MPH_MPPCLONE_TOKEN = process.env.MPH_MPPCLONE_TOKEN;

class ClientManager {
    static logger = new Logger('ClientManager', '\x1b[34m');

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
            for (let ch of connections[uri]) {
                let client = new Client(uri, MPH_MPPCLONE_TOKEN);
                client.start();
                client.setChannel(ch._id);
                this.bindClientListeners(client, ch);
                this.clients.push(client);
            }
        }
    }

    static async bindClientListeners(cl, settings) {
        // Connection message handler
        cl.on('hi', msg => {
            // Check settings
            if (settings["custom_messages"] == true) {
                // Enable custom messages
                cl.sendArray([{
                    m: '+custom'
                }]);
            }
        });

        // Chat message handler
        cl.on('a', msg => {
            this.handleChatMessage(msg, cl);
        });
    }

    static async handleChatMessage(msg, cl) {
        msg.args = msg.a.split(' ');

        for (let p of Object.values(Prefix.prefixes)) {
            if (!msg.args[0].startsWith(p.prefix)) continue;
            msg.prefix = p.prefix;
        }

        if (!msg.prefix) return;

        msg.cmd = msg.args[0].substring(msg.prefix.length).trim();
        
        if (msg.cmd == "") return;

        let m = await CommandHandler.handleMessage(msg, cl, 'mpp');
        if (m !== "" && m !== undefined) {
            cl.sendArray([{
                m: 'a',
                message: m,
                channel: msg.channel
            }]);
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
