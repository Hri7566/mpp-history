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
 * - mph: MPP History
 */

/**
 * TODO maybe add a "last updated" timestamp to the user object
 * TODO discord bot and website that use the same command handler
 * TODO logging types
 */

const { WebRequestServer } = require('./WebRequestServer');

/**
 * Module imports
 */
const { fork } = require('child_process');
const { resolve, join } = require('path');

/**
 * Module-level declarations
 */

class Server {
    static dataManager;

    /**
     * Initialize the server
     */
    static async start() {
        // Print logo
        // Do not change the spacing
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
        await this.startDataManager();
        await WebRequestServer.start();
    }

    /**
     * Stop the server
     */
    static async stop() {
        console.log('Stopping server...');
    }

    /**
     * Start the data manager process
     */
    static async startDataManager() {
        this.dataManager = fork(resolve(join(__dirname, 'DataManager', 'DataManager.js')), {
            silent: false
        });

        this.dataManager.on('message', msg => {
            console.log(`message from child: ${msg}`);
            if (msg == 'ready') {
                console.log('DataManager ready');
            // } else if (msg == 'stopped') {
            //     console.log('DataManager stopped');
            //     this.dataManager.kill();
            }
        });
    }
}

// Start the server
Server.start();

process.on('SIGINT', async sig => {
    // Handle quit signal (Ctrl + C)
    console.log(`Received ${sig}`);
    await Server.stop();
    process.exit();
});

module.exports = {
    Server
}
