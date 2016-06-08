let mp = require('msgpack-lite');

module.exports = class {
    parse(input) {
        return mp.decode(input);
    }
}