/*global require, __dirname */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var split = require('split');
var term = require('term.js');
var Shell = require('./libs/ssh-shell/').Shell;

server.listen(3000);
var io = require('socket.io')(server);

app.use(express.call('static', __dirname + '/public'));
app.use(term.middleware());

var shell = new Shell();
shell.once('ready', function () {
    shell.outputStream(function (stream) {
        var i = 0;
        stream.pipe(split()).on('data', function (data) {
            console.log('>' + data);
        });
    });
    shell.write('ls\r\n');

});

shell.connect('192.168.33.10', 22, 'vagrant', 'vagrant');
