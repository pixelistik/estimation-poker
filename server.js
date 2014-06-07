var static = require("node-static");
var clientFiles = new static.Server("./client");

var app = require("http").createServer(handler);

var io = require("socket.io").listen(app);

var port = Number(process.env.PORT || 5000);
app.listen(port);

function handler (request, response) {
	request.addListener("end", function () {
		clientFiles.serve(request, response);
	}).resume();
}

io.sockets.on("connection", function (socket) {
	var group;
	socket.on("join", function (data) {
		socket.join(data.groupName);

		socket.userUuid = data.userUuid;

		group = data.groupName;
		socket.broadcast.to(group).emit("who is there");
	});

	socket.on("update", function (data) {
		socket.broadcast.to(group).emit("update", data);
	});

	socket.on("disconnect", function () {
		socket.broadcast.to(group).emit("user disconnected", socket.userUuid);
	});

	socket.on("new round", function () {
		socket.broadcast.to(group).emit("new round");
	});
});

