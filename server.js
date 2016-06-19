/* jshint node: true */
"use strict";

var express = require("express");
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var socketio = require("socket.io");

var port = Number(process.env.PORT || 5000);

var app = express();
var server = app.listen(port);

var io = socketio.listen(server);

app.engine("html", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/client");

var packageInfo = require("./package.json");

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

app.use(compression());

app.get("/", function (request, response) {
	response.render("index.html", indexData);
});

app.use(express.static("./client", { maxAge: 1000 * 3600 * 24 * 365 }));

if (!process.env.PRODUCTION_MODE) {
	// Automatic reloading for convenient dev environment
	require("reload")(server, app, 1500);
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
