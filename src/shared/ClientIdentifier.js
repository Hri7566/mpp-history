class ClientIdentifier {
    // identifier (string): _id@uri#channel
    static parse(str) {
        let id = str.split('@')[0];
        let uri = str.split('@')[1].split('#')[0];
        let channel = str.split('@')[1].split('#')[1];
        return {
            id: id,
            uri: uri,
            channel: channel
        };
    }

    static stringify(cl) {
        if (!cl.isConnected()) return;
        return `${cl.getOwnParticipant()._id}@${cl.uri}#${cl.channel._id}`;
    }

    static generate(_id, uri, channel) {
        return `${_id}@${uri}#${channel}`;
    }
}

module.exports = {
    ClientIdentifier
}
