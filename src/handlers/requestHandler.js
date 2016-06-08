let mp = require('msgpack-lite');
let rp = require('./../services/requestParser');
let lh = require('./../handlers/user/loginHandler');

module.exports = class {

    constructor(inputMP) {
        let requestParser = new rp();
        this.request = requestParser.parse(inputMP);
        this.process();
    }

    process() {
        if (this.request.path == "user/login") {
            (new lh()).handle(this.request);
        }
        // .. Write more handlers here
    }
}