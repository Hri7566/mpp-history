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
        return new Promise(async (resolve, reject) => {
            await this.bindRequestEvents();

            this.app.listen(this.port, () => {
                resolve();
            });
        });
    }

    static async bindRequestEvents() {
        this.app.get('/', (req, res) => {
            res.send("hi").end();
        });

        this.app.get('/beans', (req, res) => {
            res.send('beans').end();
        });
    }
}

module.exports = {
    WebRequestServer
}
