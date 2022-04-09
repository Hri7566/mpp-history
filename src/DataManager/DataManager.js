const { Level } = require('level');

class User {
    // Key for user data
    static keyBase = "user~";
    
    constructor(p) {
        //! must be JSON-compatible 24/7
        if (!User.isParticipant(p)) return;
        this.participantHistory = [p];
        this.latestUpdate = Date.now();
    }

    // Methods are static because they can't be saved in JSON

    static isParticipant(p) {
        if (!('_id' in p) || !('name' in p)) return false
        if ('override' in p) {
            return p.override == 'participant';
        }
        return true;
    }

    static isUser(u) {
        if (!("participantHistory" in u)) return false;
        return true;
    }

    /**
     * Get a user's latest participant object
     * @param {User} u User to get data from
     * @returns {*} Participant data
     */
    static getLatestParticipant(u) {
        if (!('participantHistory' in u)) return null;
        return u.participantHistory[u.participantHistory.length - 1];
    }

    /**
     * Update a user's participant history
     * @param {User} u User to update
     * @param {*} p Participant data to append
     */
    static updateUser(u, p) {
        u.latestUpdate = Date.now();
        u.participantHistory.push(p);
    }
}

class DataManager {
    // Handle every data request here
    static userDataDB;

    /**
     * Initialize the data manager
     */
    static async start() {
        console.log('Starting DataManager...');
        this.userDataDB = new Level('./data/history.db', { valueEncoding: 'json' });
        process.send('ready');
    }
    
    /**
     * Stop the data manager
     */
    static async stop() {
        console.log('Stopping DataManager...');
        await this.userDataDB.close();
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
