"use strict";

var UserFactory = function (ko, Tools) {

	var User = function (socket, uuid) {
		var self = this;

		var DEFAULT_DISPLAY_NAME = "new user";

		self.uuid = uuid || Tools.uuid();

		self.name = ko.observable("");

		self.displayName = ko.pureComputed(function () {
			return self.name() || DEFAULT_DISPLAY_NAME;
		});

		self.estimation = ko.observable(false);

		self.broadcast = function () {
			socket.emit("update", ko.toJSON(self));
		};

		self.loadFromCookie = function () {
			if(
				Tools.readCookie("ep.user.name") &&
				Tools.readCookie("ep.user.uuid")
			) {
				self.name(Tools.readCookie("ep.user.name"));
				self.uuid = Tools.readCookie("ep.user.uuid");
			}
		};

		self.saveToCookie = function () {
			Tools.createCookie("ep.user.name", self.name());
			Tools.createCookie("ep.user.uuid", self.uuid);
		};

		self.isConnected = ko.observable(false);
		self.isWatcher = ko.observable(false);

		self.isWatcher.subscribe(function (value) {
			if (value === true) {
			self.estimation(false);
			}
		});
	};

	return User;
};

module.exports = UserFactory;
