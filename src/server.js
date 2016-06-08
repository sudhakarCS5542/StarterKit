// Imports
let mp = require('msgpack-lite');
let reqHandler = require('./handlers/requestHandler');

// Create new server
module.exports = class {

	constructor(wss) {
		console.log('Initializing Server.');
		this.wss = wss;
		this.connection;
		this.onInit();
	}

	onInit() {
		this.wss.on('connection', (ws) => {
			ws.send('Connected to API Server. Listening for messages.');
			this.connection = ws;
			this.onConnect();
		});
	}

	onConnect() {
		this.connection.on('message', function (data, flags) {
			if(!flags.binary) throw new Error("Data sent is not MessagePack binary");
			let rh = new reqHandler(data);
		});
	}

}

// do the thing