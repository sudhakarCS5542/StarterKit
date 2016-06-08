let request = { path: "user/login", name: "Sushruth", pass: "myPass" };
let mp = require('msgpack-lite');

var WebSocket = require('streamws');
var ws = new WebSocket('ws://localhost:8642');

ws.on('open', () => {
    ws.send(mp.encode(request), { binary: true, mask: true });
});