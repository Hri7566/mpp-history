class Command {
    static commands = {};

    constructor(id, acc, usage, desc, cb, permNode, dependent) {
        this.id = id;
        this.acc = acc;
        this.usage = usage;
        this.desc = desc;
        this.cb = cb;
        this.permNode = permNode;
        this.dependent = dependent || 'independent';
    }

    static addCommand(cmd) {
        this.commands[cmd.id] = cmd;
    }
}

class CommandHandler {
    static async handleMessage(msg, cl, platform) {
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

            return await cmd.cb(msg, platform, cl);
        }
    }
}

Command.addCommand(new Command('help', ['help', 'h', 'cmds'], '%Phelp', 'Displays all commands', async (msg, cl, platform) => {
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

module.exports = {
    CommandHandler,
    Command
}
