const { Level } = require('level');
const { Logger } = require('../shared/Logger');
const SuperKeys = require('./SuperKeys');

class HistoryUser {
    constructor(p) {
        //! must be JSON-compatible 24/7
        if (!HistoryUser.isParticipant(p)) return;
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
     * @param {HistoryUser} u User to get data from
     * @returns {*} Participant data
     */
    static getLatestParticipant(u) {
        if (!('participantHistory' in u)) return null;
        return u.participantHistory[u.participantHistory.length - 1];
    }

    /**
     * Update a user's participant history
     * @param {HistoryUser} u User to update
     * @param {*} p Participant data to append
     */
    static updateUser(u, p) {
        u.latestUpdate = Date.now();
        u.participantHistory.push(p);
    }
}

class Permission {
    /**
     * Check two permissions for equality
     * @param {string} p1 Permission
     * @param {string} p2 Permission
     * @returns boolean
     */
    static checkPermissions(p1, p2) {
        p1 = p1.split('.');
        p2 = p2.split('.');

        for (let i = 0; i < p1.length; i++) {
            if (p1[i] == '*' || p2[i] == '*') continue;
            if (p1[i] != p2[i]) return false;
        }

        return true;
    }
}

class PermissionGroup {
    static groups = {
        'DEFAULT': new PermissionGroup('DEFAULT', [
            'command.help'
        ]),
        'ADMIN': new PermissionGroup('ADMIN', [
            '*'
        ])
    };

    constructor(id, permissions) {
        this.id = id;
        this.permissions = permissions;
    }
    
    static getGroup(id) {
        return PermissionGroup.groups[id];
    }

    /**
     * Check if a group has a permission
     * @param {string} group String ID of group to check
     * @param {string} perm Permission
     */
    static checkGroupPermission(group, perm) {
        let groupObj = PermissionGroup.groups[group];
        if (!groupObj) return false;
        return groupObj.permissions.some(p => Permission.checkPermissions(p, perm));
    }
}

class PermissionUser {
    constructor(id, groups, permissions) {
        //! must be JSON-compatible
        this.id = id;
        this.groups = groups || ['DEFAULT'];
        this.permissions = permissions || [];
    }
}

class DataManager {
    static logger = new Logger('Data', '\x1b[34m');

    // Handle every data request here
    static db;
    static keys = new Map();

    /**
     * Initialize the data manager
     */
    static async start() {
        this.logger.log('Starting DataManager...');
        this.db = new Level('./data/history.db', { valueEncoding: 'json' });
        await this.setDefaultData();
        process.send('ready');
    }
    
    /**
     * Stop the data manager
     */
    static async stop() {
        this.logger.log('Stopping DataManager...');
        await this.db.close();
        process.send('stopped');
    }

    static async setDefaultData() {
        if (await this.getSetting('init') == 1) return;
        await this.putSetting('init', 1);
    }

    static putSetting(subkey, val) {
        return new Promise((resolve, reject) => {
            this.db.put(SuperKeys['settings'] + subkey, val, (err) => {
                if (err) resolve(err);
                else resolve();
            });
        });
    }

    static getSetting(subkey) {
        return new Promise((resolve, reject) => {
            this.db.get(SuperKeys['settings'] + subkey, (err, val) => {
                if (err) resolve(err);
                else resolve(undefined, val);
            });
        });
    }

    static settingExists(subkey) {
        return new Promise((resolve, reject) => {
            this.db.get(SuperKeys['settings'] + subkey, (err, val) => {
                if (err) resolve(err);
                else resolve(undefined, val);
            });
        });
    }

    static putPermissionUser(pu, val) {
        return new Promise((resolve, reject) => {
            this.db.put(SuperKeys['user_permissions'] + pu.id, val, (err) => {
                if (err) resolve(err);
                else resolve();
            });
        });
    }

    static getPermissionUser(id) {
        return new Promise((resolve, reject) => {
            this.db.get(SuperKeys['user_permissions'] + id, (err, val) => {
                if (err) resolve(err);
                else resolve(undefined, val);
            });
        });
    }
}

DataManager.start();

process.on('SIGINT', async (sig) => {
    await DataManager.stop();
    process.exit();
});

module.exports = {
    DataManager,
    User
}
