const { Logger } = require('../shared/Logger');
const { EventEmitter } = require('events');

class Command {
    static commands = {};

    constructor(id, acc, usage, desc, cb, permNode, flags, dependent) {
        this.id = id;
        this.acc = acc;
        this.usage = usage;
        this.desc = desc;
        this.cb = cb;
        this.permNode = permNode || 'user.command';
        this.flags = flags || {};
        this.dependent = dependent || 'independent';
    }

    static addCommand(cmd) {
        this.commands[cmd.id] = cmd;
    }

    static removeCommand(cmd) {
        for (let k of Object.keys(this.commands)) {
            if (this.commands[k] == cmd) {
                delete this.commands[k];
            }
        }
    }

    static removeCommandFuzzy(str) {
        let found_cmd;

        mainLoop:
        for (let cmd of Object.values(this.commands)) {
            accLoop:
            for (let a of cmd.acc) {
                if (a.toLowerCase().includes(str.toLowerCase())) {
                    found_cmd = cmd;
                    break mainLoop;
                }
            }
        }

        this.removeCommand(found_cmd);
    }
}

class CommandManager {
    static logger = new Logger('Commands', '\x1b[34m');

    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static once = EventEmitter.prototype.once;
    static emit = EventEmitter.prototype.emit;

    static start() {
        this.logger.log('Starting command manager...');
        this.bindEvents();
        this.sendMessage({
            m: 'ready'
        });
    }

    static stop() {
        this.logger.log('Stopping command manager...');
    }

    static sendMessage(msg) {
        process.send(JSON.stringify(msg));
    }

    static async receiveServerMessage(msg) {
        try {
            msg = JSON.parse(msg);
            this.emit(msg.m, msg);
        } catch (err) {
            this.logger.error(err);
        }
    }

    static async bindEvents() {
        this.on('client command', async msg => {
            this.logger.log('Received client command...');
            let out = await this.handleMessage(msg.msg.msg);

            if (typeof out == 'string') {
                if (out !== '') {
                    this.sendMessage({
                        m: 'client command response',
                        cl: msg.msg.cl,
                        original_message: msg,
                        out: out
                    });
                }
            }
        });

        this.on('add command', msg => {
            Command.addCommand(msg.command);
        });
    }

    static async handleMessage(msg, platform) {
        cmdLoop:
        for (let cmd of Object.values(Command.commands)) {
            if (cmd.dependent !== 'independent') {
                if (platform !== cmd.dependent) continue cmdLoop;
            }

            accLoop:
            for (let a of cmd.acc) {
                if (msg.cmd !== a) continue accLoop;
                msg.acc = a;
            }

            if (!msg.acc) continue cmdLoop;

            // TODO permissions

            return await cmd.cb(msg);
        }
    }
}

CommandManager.start();

process.on('SIGINT', async (sig) => {
    await CommandManager.stop();
    process.exit();
});

process.on('message', async (msg) => {
    await CommandManager.receiveServerMessage(msg);
});

Command.addCommand(new Command('help', ['help', 'h', 'cmds'], '%Phelp', 'Displays all commands', async (msg, platform) => {
    let list = "Commands:";

    for (let cmd of Object.values(Command.commands)) {
        if (cmd.dependent !== 'independent') {
            if (platform !== cmd.dependent) continue;
        }

        list += ` ${msg.prefix}${cmd.acc[0]} |`;
    }

    list = list.substring(0, list.length - 1).trim();

    return list;
}));

Command.addCommand(new Command('about', ['about', 'a'], '%Pabout', 'Returns information about this bot', async (msg, platform) => {
    return `This bot will eventually be used to search user data more thoroughly than Theta. MPP History - by Hri7566 (not to be confused with JPDLD's Bot)`;
}))

module.exports = {
    CommandManager,
    Command
}
