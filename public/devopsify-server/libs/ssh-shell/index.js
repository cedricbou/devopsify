/*global require, exports */

var Promise = require('bluebird');
var Ssh = Promise.promisifyAll(require('ssh2'));
var streamify = require('streamify');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function Shell() {
    'use strict';
    
    var self = this;
    
    var client = new Ssh();
    var stream = streamify();
    var originalStream = undefined;
    var closed = true;
    
    client.on('end', function() {
        closed = true;
        self.emit('end');
    });
    
    client.on('ready', function() {
        closed = false;
        client.shell(function(err, shellStream) {
            if (err) throw err;
            originalStream = shellStream;
            //stream.resolve(shellStream);
            self.emit('ready');
            shellStream.on('data', function (data) {
               console.log('>>> ' + data); 
            });
        });
    });
    
    this.connect = function (host, port, user, pwd) {
        client.connect({
            host: host,
            port: port,
            username: user,
            password: pwd
        });
    };
    
    this.outputStream = function(onOutputStream) {
        onOutputStream(stream);
    }
    
    this.write = function (data) {
        if(!closed) {
            console.log('===> write it');
            stream.write('ls\r\n');
        }
    }
    
    this.close = function () {
        client.end();
    }
    
    this.closed = function () {
        return closed;
    }
};

inherits(Shell, EventEmitter);

module.exports.Shell = Shell;