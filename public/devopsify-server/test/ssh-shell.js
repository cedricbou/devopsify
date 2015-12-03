/*global require, describe, it, beforeEach, before */

var mockShell = require('./libs/ssh2-mock/').MockShell('user.pub', 'host.key');
var Shell = require('../libs/ssh-shell/').Shell;
var split = require('split');
var expect = require('expect.js');

describe('SSH2 Shell Module', function () {
    'use strict';
    
    describe('a shell connected to SSH2 with login and password', function () {
        var prompt = '',
            lineNo = 0,
            mock,
            shell;
        
        before(function () {
            mock = mockShell.createServer().listen(6222);
        });
        
        describe('just after authentification', function () {
            before(function () {
                mock.prompt(function (stream, done) {
                    stream.stdout.write('welcome' + '\r\n');
                    done();
                });
            });
        
            beforeEach(function (done) {
                prompt = '';
                lineNo = 0;

                shell = new Shell();
                shell.once('ready', function () {
                    shell.once('end', function () {
                        done();
                    });

                    shell.outputStream(function (stream) {
                        stream.pipe(split()).on('data', function (data) {
                            if (lineNo === 0) {
                                prompt = data;
                                shell.close();
                            }
                            lineNo = lineNo + 1;
                        });
                    });
                });
                shell.connect('localhost', 6222, 'foo', 'bar');
            });

            it('should be prompted "welcome" after connecting and close connection', function () {
                expect('welcome').to.be.eql(prompt);
                expect(shell.closed()).to.be.ok();
            });

            it('should still be prompted "welcome" after re-connecting and close connection', function () {
                expect('welcome').to.be.eql(prompt);
                expect(shell.closed()).to.be.ok();
            });
        });
        
        describe('after issuing a ls command', function () {
            var results = [];
  
            before(function () {
                mock.prompt(function () {});
                mock.onLine(function (line, stream, done) {
                    if (line === 'ls') {
                        stream.stdout.write('file1 file2 file3' + '\r\n');
                        stream.stdout.write('file4 file5 file6' + '\r\n');
                        done();
                    }
                });
                mock.onReady(function (stream) {
                    stream.push('l');
                    stream.push('s');
                    stream.push('\r');
                    stream.push('\n');
                });
            });
            
            beforeEach(function (done) {
                results = [];

                shell = new Shell();
                shell.once('ready', function () {
                    shell.once('end', function () {
                        done();
                    });

                    shell.outputStream(function (stream) {
                        stream.pipe(split()).on('data', function (data) {
                            results.push(data);
                            if (data === '') {
                                shell.close();
                            }
                        });
                    });
                });
                shell.connect('localhost', 6222, 'foo', 'bar');
            });
            
            it('should provide back a list of filenames on two lines', function () {
                expect("file1 file2 file3").to.be.eql(results[0]);
                expect("file4 file5 file6").to.be.eql(results[1]);
            });
        });
        
    });
});