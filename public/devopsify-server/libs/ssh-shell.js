var ssh = require('ssh2');

/*global require */
function Shell(io) {
    'use strict';
    
server.listen(3000);
var io = require('socket.io')(server);
    
app.use(express.static(__dirname + '/public'));
app.use(term.middleware());

io.on('connection', function (socket) {
  var conn = new ssh();
  conn.on('ready', function() {
    socket.emit('data', '\n*** SSH CONNECTION ESTABLISHED ***\n');
    conn.shell(function(err, stream) {
      if (err)
        return socket.emit('data', '\n*** SSH EXEC ERROR: ' + err.message + ' ***\n');
      stream.on('data', function(d) {
        socket.emit('data', d.toString('binary'));
      }).on('close', function() {
        conn.end();
      });
      socket.on('data', function(data) {
         stream.write(data);
      });
    });
  }).on('close', function() {
    socket.emit('data', '\n*** SSH CONNECTION CLOSED ***\n');
  }).connect({
    host: '192.168.33.10',
    port: 22,
    username: 'vagrant',
    password: 'vagrant'
  });
});

}

exports.module.Shell = Shell;