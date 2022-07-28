const { Prefix } = require("../shared/Prefix")

module.exports = {
    connectionList: {
        "wss://mppclone.com:8443": [
            {
                _id: "The Dev Channel",
                custom_messages: true
            }
        ]
    },
    usersetInitializationVector: {
        // default prefix
        name: `MPP History [${Object.values(Prefix.prefixes)[0].prefix}help]`,
        color: "#e652f5"
    }
}
