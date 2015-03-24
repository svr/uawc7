'use strict';

var MathParser = require('./parser');
var Gitter = require('node-gitter');

var COMMAND_REGEXP = new RegExp('^calc\\s+(.+)$');

var showUsageMessage = function () {
    console.log('Usage: node app.js username/room');
};

if (process.argv.length !== 3) {
    showUsageMessage();
    process.exit(1);
}
var gitterChat = process.argv[2];
var gitter = new Gitter('ee0846bd3db4eda62bea2c32edda9ea24e895189');

gitter.rooms.join(gitterChat).then(function (room) {
    var events = room.listen();
    console.log(' --- Waiting for commands in ', room.name);
    events.on('message', function (message) {
        var commandMatched = COMMAND_REGEXP.exec(message.text);
        if (commandMatched) {
            console.log('COMMAND: ', commandMatched[1]);
            var parser = new MathParser(commandMatched[1]);
            var result = commandMatched[1] + '=';
            try {
                result += parser.evaluate(parser.parse());
            } catch (e) {
                result = e.message;
            } finally {
                room.send(result + '');
                console.log('RESULT: ', result);
            }
        }
    });
});
