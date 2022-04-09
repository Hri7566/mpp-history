const { Level } = require('level');

class User {
    //! must be JSON-compatible 24/7
    static keyBase = "user~";
    
    constructor(p) {
        // check if p is a participant
        this.latestParticipant = p;
        this.participantHistory = [p];
    }

    static isParticipant(p) {
        if (!('_id' in p) || !('name' in p)) return false
        if ('override' in p) {
            return p.override == 'participant';
        }
        return true;
    }
}

class DataManager {
    // handle all data requests here
    static db;

    static async start() {
        console.log('Starting DataManager...');
        this.db = new Level('./data/history.db', { valueEncoding: 'json' });
        process.send('ready');

        process.on('message', async msg => {
            console.log('parent of data: ' + msg);
            if (msg == 'stop') {
                await this.stop();
            }
        });
    }
    
    static async stop() {
        console.log('Stopping DataManager...');
        await this.db.close();
        process.send('stopped');
    }
}

DataManager.start();

process.on('SIGINT', async (sig) => {
    console.log('DataManager Received ' + sig);
    await DataManager.stop();
    process.exit();
});

module.exports = {
    DataManager,
    User
}
