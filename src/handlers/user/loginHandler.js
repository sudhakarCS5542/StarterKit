module.exports = class {
    handle(req) {
        console.log('Loggin attempt for ' + req.name);
        if (req.pass == "myPass") {
            console.log('- Loggin succesfull');
        }
    }
}