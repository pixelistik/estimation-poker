/* jshint node: true */
"use strict";

var express = require("express");
var compression = require("compression");
var mustacheExpress = require("mustache-express");
var socketio = require("socket.io");

const prometheusClient = require("prom-client");

var port = Number(process.env.PORT || 5000);

var app = express();
var server = app.listen(port);

var monitoringApp = express();
monitoringApp.listen(9091);

var io = socketio.listen(server);

app.engine("html", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/client");

var packageInfo = require("./package.json");

var indexData = {
  packageInfo: packageInfo,
};

if (process.env.PIWIK_URL && process.env.PIWIK_SITE_ID) {
  indexData.piwik = {
    url: process.env.PIWIK_URL,
    siteId: process.env.PIWIK_SITE_ID,
  };
}

if (process.env.PRODUCTION_MODE) {
  indexData.productionMode = true;
}

const gauge = new prometheusClient.Gauge({
  name: "connected_sockets_count",
  help: "number of currently connected websockets",
});
app.use(compression());

app.get("/", function (request, response) {
  response.render("index.html", indexData);
});

app.use(express.static("./client", { maxAge: 1000 * 3600 * 24 * 365 }));

monitoringApp.get("/metrics", async function (request, response) {
  var srvSockets = io.sockets.sockets;
  const connectedUserCount = Object.keys(srvSockets).length;

  gauge.set(connectedUserCount); // Set to 10

  response.set("Content-Type", prometheusClient.register.contentType);
  response.end(await prometheusClient.register.metrics());
  //   response.send(connectedUserCount + "");
});

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

  socket.on("kick user", function (targetUuid) {
    // Nur dem gezielten Nutzer das Kick-Event senden:
    var allSockets = io.sockets.sockets;
    for (var id in allSockets) {
      var s = allSockets[id];
      if (s.userUuid === targetUuid) {
        s.emit("kick user");
        break;
      }
    }
  });
});
