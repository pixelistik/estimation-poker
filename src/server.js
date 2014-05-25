var static = require('node-static');
var clientFiles = new static.Server('./client');

var app = require('http').createServer(handler);

var io = require('socket.io').listen(app);

app.listen(8080);

function handler (request, response) {
	request.addListener('end', function () {
		clientFiles.serve(request, response);
	}).resume();
}
/*
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
*/

io.sockets.on('connection', function (socket) {
	var group;
	socket.on('join', function (data) {
		socket.join(data.groupName);
		group = data.groupName;
		console.log("Client joined group " + data.groupName);
	});

	socket.on('update', function (data) {
		socket.broadcast.to(group).emit('update', data);
		console.log(data);
	});
});
