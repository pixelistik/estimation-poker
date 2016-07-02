"use strict";

var ko = require("knockout");
var io = require("socket.io-client");

var Tools = require("./tools.js");
var User = require("./models/User.js")(ko, Tools);
var LocalUser = require("./models/User.js")(User);
var PokerView = require("./models/PokerView.js")(ko, Tools, User, io, window, LocalUser);

if(location.hash === "") {
	location.hash = Tools.base64Id(8);
}
var poker = new PokerView(location.hash);
ko.components.register('card', {
	template: { element: 'card' }
});

require("./bindings/editableText.js")(ko);
require("./bindings/estimationSelect.js")(ko, document);
require("./bindings/pageTitle.js")(ko, document);

ko.applyBindings(poker);

/* globals QRCode */
new QRCode(document.getElementById("sharing-qr-code"), location + "");

Tools.init();

document.querySelector("body").classList.remove("uninitialised");
