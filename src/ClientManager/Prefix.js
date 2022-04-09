class Prefix {
    static prefixes = {};

    constructor(prefix) {
        this.prefix = prefix;
        Prefix.prefixes[prefix] = this;
    }

    static replacePrefixString(str, prefix) {
        return str.split('%P').join(prefix);
    }
}

new Prefix('/');

module.exports = {
    Prefix
}
