"use strict";

var UserFactory = function (ko, Tools) {

	var User = function (socket, uuid) {
		var DEFAULT_DISPLAY_NAME = "new user";

		this.uuid = uuid || Tools.uuid();

		this.name = ko.observable("");

		this.displayName = ko.pureComputed(function () {
			return this.name() || DEFAULT_DISPLAY_NAME;
		}.bind(this));

		this.estimation = ko.observable(false);

		this.broadcast = function () {
			socket.emit("update", ko.toJSON(this));
		};

		this.loadFromCookie = function () {
			if(
				Tools.readCookie("ep.user.name") &&
				Tools.readCookie("ep.user.uuid")
			) {
				this.name(Tools.readCookie("ep.user.name"));
				this.uuid = Tools.readCookie("ep.user.uuid");
			}
		};

		this.saveToCookie = function () {
			Tools.createCookie("ep.user.name", this.name());
			Tools.createCookie("ep.user.uuid", this.uuid);
		};

		this.isConnected = ko.observable(false);
		this.isWatcher = ko.observable(false);

		this.isWatcher.subscribe(function (value) {
			if (value === true) {
			this.estimation(false);
			}
		}.bind(this));
	};

	return User;
};

module.exports = UserFactory;
