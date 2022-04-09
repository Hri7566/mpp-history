class ClientManager {
    // TODO mpp client handler
    // TODO mppclone custom messages

    /**
     * Initialize the client manager
     */
    static async start() {

    }

    /**
     * Stop the client manager
     */
    static async stop() {

    }
}

ClientManager.start();

process.on('SIGINT', async (sig) => {
    console.log('ClientManager Received ' + sig);
    await ClientManager.stop();
    process.exit();
});

module.exports = {
    ClientManager
}
