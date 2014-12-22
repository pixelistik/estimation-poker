/* jshint node: true */
"use strict";
var fs = require('fs');
var express = require("express");
var compression = require('compression');

var app = express();
var port = Number(process.env.PORT || 5000);
var server = app.listen(port);

var io = require("socket.io").listen(server);

var packageInfo = require("./package.json");

var mustache = require('mustache');

var indexData = {
	packageInfo: packageInfo
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

app.use(compression());

app.get("/", function (request, response) {
	response.send(indexHtml);
});

app.use(express.static("./client"));

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

