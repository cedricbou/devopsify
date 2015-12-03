/*global require, console, module */
var ssh2 = require('ssh2');

var fs = require('fs');
var crypto = require('crypto');
var EventEmitter = require('events').EventEmitter;
var inspect = require('util').inspect;
var inherits = require('util').inherits;
var buffersEqual = require('buffer-equal-constant-time');
var ssh2 = require('ssh2');
var split = require('split');
var utils = ssh2.utils;

function MockShell(publicKey, hostKey) {
    'use strict';
    var pubKey = utils.genPublicKey(utils.parseKey(fs.readFileSync(publicKey))),
        donotlog = true,
        welcomePrompt = function () {},
        mock   = function () {},
        server,
        readyCallback = function () {};

    function authentification(ctx) {
        if (ctx.method === 'password'
                && ctx.username === 'foo'
                && ctx.password === 'bar') {
            ctx.accept();
        } else if (ctx.method === 'publickey'
                && ctx.key.algo === pubKey.fulltype
                && buffersEqual(ctx.key.get('data'), pubKey.get('public'))) {
            if (ctx.signature) {
                var verifier = crypto.createVerify(ctx.sigAlgo);
                verifier.update(ctx.blob);
                if (verifier.verify(pubKey.publicOrig, ctx.signature, 'binary')) {
                    ctx.accept();
                } else {
                    ctx.reject();
                }
            } else {
                // if no signature present, that means the client is just checking
                // the validity of the given public key
                ctx.accept();
            }
        } else {
            ctx.reject();
        }
    }
    
    this.prompt = function prompt(behaviour) {
        welcomePrompt = behaviour;
        return this;
    };
    
    this.onLine = function onLine(behaviour) {
        mock = behaviour;
        return this;
    };
    
    this.onReady = function onReady(behaviour) {
        readyCallback = behaviour;
        return this;
    };
    
    this.listen = function listen(port) {
        server.listen(port);
        return this;
    };
        
    this.createServer = function createServer() {
        server = new ssh2.Server({
            privateKey: fs.readFileSync('host.key')
        }, function (client) {
            donotlog || console.log('Client connected!');
            client.on('authentication', authentification).on('ready', function () {
                donotlog || console.log('Client authenticated!');

                client.on('session', function (accept, reject) {
                    var session = accept();
                    session.once('pty', function (accept, reject, info) {
                        donotlog || console.log('Client wants to execute: ' + inspect(info.command));
                        var pty = accept();
                        session.once('shell', function (accept, reject) {
                            var stream = accept(),
                                done = function () {
                                    stream.exit(0);
                                    stream.end();
                                };

                            stream.pipe(split()).on('data', function (data) {
                                mock(data, stream, done);
                            });
                            
                            welcomePrompt(stream, done);
                            
                            readyCallback(stream);
                        });
                    });
                });
            }).on('end', function () {
                donotlog || console.log('Client disconnected');
            });
        });
        return this;
    };
    
    return this;
}

module.exports.MockShell = MockShell;
