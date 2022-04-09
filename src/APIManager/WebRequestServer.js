// TODO move this to API folder and use child process

const express = require('express');

class WebRequestServer {
    // handle all web requests here
    static app = express();
    static port = 31415;

    static async start() {
        await this.listen();
    }

    static listen() {
        return new Promise((resolve, reject) => {
            this.app.listen(this.port, () => {
                resolve();
            });
        });
    }
}

module.exports = {
    WebRequestServer
}
