(function (EP, ko) {
	"use strict";

	EP.User = function (socket, uuid) {
		var self = this;

		var DEFAULT_DISPLAY_NAME = "new user";

		self.uuid = uuid || EP.Tools.uuid();

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
				EP.Tools.readCookie("ep.user.name") &&
				EP.Tools.readCookie("ep.user.uuid")
			) {
				self.name(EP.Tools.readCookie("ep.user.name"));
				self.uuid = EP.Tools.readCookie("ep.user.uuid");
			}
		};

		self.saveToCookie = function () {
			EP.Tools.createCookie("ep.user.name", self.name());
			EP.Tools.createCookie("ep.user.uuid", self.uuid);
		};

		self.isConnected = ko.observable(false);
		self.isWatcher = ko.observable(false);

		self.isWatcher.subscribe(function (value) {
			if (value === true) {
			self.estimation(false);
			}
		});
	};
})(window.EP = window.EP || {}, window.ko);
