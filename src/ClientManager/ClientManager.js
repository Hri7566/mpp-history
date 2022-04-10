require('dotenv').config();

const { Logger } = require('../shared/Logger');
const { Prefix } = require('./Prefix');
const Client = require('./Client');
const { ClientIdentifier } = require('../shared/ClientIdentifier');

const MPH_MPPCLONE_TOKEN = process.env.MPH_MPPCLONE_TOKEN;

class ClientManager {
    static logger = new Logger('Clients', '\x1b[34m');

    static clients = [];

    /**
     * Initialize the client manager
     */
    static async start() {
        this.logger.log('Starting client manager...');
        await this.initClients();
        this.sendMessage({
            m: 'ready'
        });
    }

    /**
     * Stop the client manager
     */
    static async stop() {
        this.logger.log('Stopping client manager...');
    }

    static sendMessage(msg) {
        process.send(JSON.stringify(msg));
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

        process.send(JSON.stringify({
            m: 'client command',
            msg: msg,
            cl: ClientIdentifier.stringify(cl)
        }));

        // TODO do this after receiving a message from the server
        // if (m !== "" && m !== undefined) {
        //     cl.sendArray([{
        //         m: 'a',
        //         message: m,
        //         channel: msg.channel
        //     }]);
        // }
    }

    static async receiveServerMessage(msg) {
        try {
            msg = JSON.parse(msg);
        } catch (err) {

        }
    }
}

ClientManager.start();

process.on('SIGINT', async (sig) => {
    await ClientManager.stop();
    process.exit();
});

process.on('message', async (msg) => {
    await ClientManager.receiveServerMessage(msg);
});

module.exports = {
    ClientManager
}
