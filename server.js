/* jshint node: true */
"use strict";
var fs = require('fs');
var nodeStatic = require("node-static");
var clientFiles = new nodeStatic.Server(
	"./client",
	{
		gzip: true,
		cache: 3600 * 24 * 365
	}
);

var app = require("http").createServer(handler);

var io = require("socket.io").listen(app);

var port = Number(process.env.PORT || 5000);
app.listen(port);

var version = require("./package.json").version;

var mustache = require('mustache');

var indexData = {
	version: version
};

if (process.env.PIWIK_URL && process.env.PIWIK_SITE_ID) {
	indexData.piwik = {
		url: process.env.PIWIK_URL,
		siteId: process.env.PIWIK_SITE_ID
	};
}

if (process.env.PRODUCTION_MODE) {
	indexData.productionMode = true;
}

var indexTemplate = fs.readFileSync("./client/index.html", "utf8");
var indexHtml = mustache.render(indexTemplate, indexData);

function handler (request, response) {
	if(request.url === "/") {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(indexHtml);
	}

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

