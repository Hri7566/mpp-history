/**
 * MPP History
 * (c) 2022 The Dev Channel, Hri7566
 * This project is not affiliated with JPDLD's original project, titled "MPP History".
 * 
 * Shorthand variables
 * - p: participant
 * - u: user
 * - cl: client
 * - sig: signal
 * - msg: JSON message (from MPP client or possibly Discord)
 */

/**
 * TODO maybe add a "last updated" timestamp to the user object
 * TODO discord bot and website that use the same command handler
 * TODO logging types
 */

const { WebRequestServer } = require('./WebRequestServer');

const { fork } = require('child_process');
const { resolve, join } = require('path');

console.log(`
\x1b[31m╔═════════════════════════════════════════════════════════════════════════════════════╗
║\x1b[36m███╗   ███╗██████╗ ██████╗     ██╗  ██╗██╗███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗\x1b[31m║
║\x1b[36m████╗ ████║██╔══██╗██╔══██╗    ██║  ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝\x1b[31m║
║\x1b[36m██╔████╔██║██████╔╝██████╔╝    ███████║██║███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝ \x1b[31m║
║\x1b[36m██║╚██╔╝██║██╔═══╝ ██╔═══╝     ██╔══██║██║╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝  \x1b[31m║
║\x1b[36m██║ ╚═╝ ██║██║     ██║         ██║  ██║██║███████║   ██║   ╚██████╔╝██║  ██║   ██║   \x1b[31m║
║\x1b[36m╚═╝     ╚═╝╚═╝     ╚═╝         ╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   \x1b[31m║
╚═════════════════════════════════════════════════════════════════════════════════════╝\x1b[0m
`);

class Server {
    static dataManager;

    static async start() {
        await this.startDataManager();
        await WebRequestServer.start();
    }

    static async stop() {
        console.log('Stopping server');
        await this.stopDataManager();
    }

    static async startDataManager() {
        this.dataManager = fork(resolve(join(__dirname, 'DataManager', 'DataManager.js')));

        this.dataManager.on('message', msg => {
            console.log(`message from child: ${msg}`);
            if (msg == 'ready') {
                console.log('DataManager ready');
            } else if (msg == 'stopped') {
                console.log('DataManager stopped');
                this.dataManager.kill();
            }
        });
    }

    static async stopDataManager() {
        console.log(`Sending stop to DataManager`);
        this.dataManager.send('stop');
    }
}

Server.start();

process.on('SIGINT', sig => {
    console.log(`Received ${sig}`);
    Server.stop();
});

module.exports = {
    Server
}
