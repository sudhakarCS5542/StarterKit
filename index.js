// Bootstrap
let APIServer = require('./src/server');
let WebSocketServer = require('streamws').Server;

let wss = new WebSocketServer({ port: 8642 });
let app = new APIServer(wss);