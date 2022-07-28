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
 * - msg: JSON/client message
 * - mph: MPP History
 */

/**
 * TODO maybe add a "last updated" timestamp to the user object
 * TODO discord bot and website that use the same command handler
 * TODO logging types
 */

/**
 * Module imports
 */
const { fork } = require('child_process');
const { resolve, join } = require('path');
const { Logger } = require('./shared/Logger');
const { EventEmitter } = require('events');

/**
 * Module-level declarations
 */

class Server {
    static dataManager;
    static clientManager;
    static apiManger;
    static logger = new Logger('Server', '\x1b[36m');

    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static emit = EventEmitter.prototype.emit;
    static once = EventEmitter.prototype.once;

    /**
     * Initialize the server
     */
    static async start() {
        // Print logo
        // Do not change the spacing
        process.stdout.write(`\x1b[31m╔═════════════════════════════════════════════════════════════════════════════════════╗
║\x1b[36m███╗   ███╗██████╗ ██████╗     ██╗  ██╗██╗███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗\x1b[31m║
║\x1b[36m████╗ ████║██╔══██╗██╔══██╗    ██║  ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝\x1b[31m║
║\x1b[36m██╔████╔██║██████╔╝██████╔╝    ███████║██║███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝ \x1b[31m║
║\x1b[36m██║╚██╔╝██║██╔═══╝ ██╔═══╝     ██╔══██║██║╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝  \x1b[31m║
║\x1b[36m██║ ╚═╝ ██║██║     ██║         ██║  ██║██║███████║   ██║   ╚██████╔╝██║  ██║   ██║   \x1b[31m║
║\x1b[36m╚═╝     ╚═╝╚═╝     ╚═╝         ╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   \x1b[31m║
╚═════════════════════════════════════════════════════════════════════════════════════╝\x1b[0m
`);

        await this.bindListeners();
        await this.startDataManager();
        await this.startAPIManager();
        await this.startClientManager();
        await this.startCommandManager();

        this.logger.log('Server started.');
    }

    /**
     * Stop the server
     */
    static async stop() {
        this.logger.log('Stopping server...');
    }

    /**
     * Start the data manager process
     */
    static async startDataManager() {
        this.dataManager = fork(resolve(join(__dirname, 'DataManager', 'DataManager.js')), {
            silent: false
        });

        this.dataManager.on('message', msg => {
            try {
                msg = JSON.parse(msg);
                msg.from = 'data';
                msg.t = Date.now();
                this.emit(msg.m, msg);
            } catch (err) {
                this.logger.error(err);
            }
        });
    }

    /**
     * Start the client manager process
     */
    static async startClientManager() {
        this.clientManager = fork(resolve(join(__dirname, 'ClientManager', 'ClientManager.js')), {
            silent: false
        });

        this.clientManager.on('message', msg => {
            try {
                msg = JSON.parse(msg);
                msg.from = 'client';
                this.emit(msg.m, msg);
            } catch (err) {
                this.logger.error(err);
            }
        });
    }

    /**
     * Start the API manager process
     */
    static async startAPIManager() {
        this.apiManger = fork(resolve(join(__dirname, 'APIManager', 'APIManager.js')), {
            silent: false
        });

        this.apiManger.on('message', msg => {
            try {
                msg = JSON.parse(msg);
                msg.from = 'api';
                this.emit(msg.m, msg);
            } catch (err) {
                this.logger.error(err);
            }
        });
    }

    /**
     * Start the command manager process
     */
    static async startCommandManager() {
        this.commandManager = fork(resolve(join(__dirname, 'CommandManager', 'CommandManager.js')), {
            silent: false
        });

        this.commandManager.on('message', msg => {
            try {
                msg = JSON.parse(msg);
                msg.from = 'cmd';
                this.emit(msg.m, msg);
            } catch (err) {
                this.logger.error(err);
            }
        });
    }

    /**
     * Bind default event listeners
     */
    static async bindListeners() {
        this.on('ready', msg => {
            switch (msg.from) {
                case 'data':
                    this.logger.log('DataManager child ready');
                    break;
                case 'cmd':
                    this.logger.log('CommandManager child ready');
                    break;
                case 'api':
                    this.logger.log('APIManager child ready');
                    break;
                case 'client':
                    this.logger.log('ClientManager child ready');
                    break;
            }
        });

        this.on('client command', msg => {
            let m = {
                m: 'client command',
                msg: msg,
                from: 'server',
                t: Date.now()
            }

            this.commandManager.send(JSON.stringify(m));
        });

        this.on('client command response', msg => {
            try {
                let m = {
                    m: 'client command response',
                    msg: msg,
                    from: 'server',
                    t: Date.now()
                }
                
                this.clientManager.send(JSON.stringify(m));
            } catch (err) {}
        });

        this.on('client manager message', msg => {
            try {
                this.clientManager.send(JSON.stringify(msg.msg));
            } catch (err) {}
        });

        this.on('data manager message', msg => {
            try {
                this.dataManager.send(JSON.stringify(msg.msg));
            } catch (err) {}
        });

        this.on('api manager message', msg => {
            try {
                this.apiManger.send(JSON.stringify(msg.msg));
            } catch (err) {}
        });

        this.on('command manager message', msg => {
            try {
                this.commandManager.send(JSON.stringify(msg.msg));
            } catch (err) {}
        });
    }
}

// Start the server
Server.start();

process.on('SIGINT', async sig => {
    // Handle quit signal (Ctrl + C)
    await Server.stop();
    process.exit();
});

module.exports = {
    Server
}
