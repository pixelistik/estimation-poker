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
	};

	EP.PokerView = function (groupName) {
		var self = this;

		var getAllEstimations = function () {
			var estimations = self.users().map(function (user) {
				return user.estimation();
			});

			estimations.push(self.localUser().estimation());

			return estimations.filter(function (estimation) {
				return estimation !== false;
			});
		};

		var getExistingUserByUuid = function (uuid) {
			return self.users().filter(function (user) {
				return user.uuid === uuid;
			})[0];
		};

		var socket = io.connect("/");

		self.initNewRound = function () {
			self.localUser().estimation(false);
			socket.emit("new round");
		};

		self.localUser = ko.observable(new EP.User(socket));
		self.localUser().loadFromCookie();

		self.localUser().name.subscribe(function () {
			self.localUser().broadcast();
			self.localUser().saveToCookie();
		});

		self.localUser().estimation.subscribe(function () {
			self.localUser().broadcast();
		});

		socket.emit(
			"join",
			{
				groupName: groupName,
				userUuid: self.localUser().uuid
			}
		);

		self.localUser().broadcast();

		self.users = ko.observableArray([]);

		self.storyTitle = ko.observable("");
		var storySubscription = self.storyTitle.subscribe(function () {
			broadcast();
		});

		// http://stackoverflow.com/a/6102340/376138
		self.highestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.max.apply(null, estimations);

			if(result === -Infinity) {
				return false;
			}
			return result;
		});

		self.lowestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.min.apply(null, estimations);

			if(result === Infinity) {
				return false;
			}
			return result;
		});

		self.estimationsComplete = ko.computed(function () {
			var estimationsCount = getAllEstimations().length;
			var usersCount = 1 + self.users().length; // +1 = localUser

			return estimationsCount === usersCount;
		});

		var broadcast = function () {
			var me = {
				storyTitle: self.storyTitle()
			};
			socket.emit("update", JSON.stringify(me));
		};

		var update = function (data) {
			var received = JSON.parse(data);

			if(received.uuid !== undefined) {
				// A user object was received:
				var user = getExistingUserByUuid(received.uuid);

				if (!user) {
					 user = new EP.User(socket, received.uuid);
					 self.users.push(user);
				}

				user.name(received.name);
				user.estimation(received.estimation);
			} else {
				// A story object was received:
				storySubscription.isDisposed = true;
				self.storyTitle(received.storyTitle);
				storySubscription.isDisposed = false;
			}
		};

		var removeUser = function (uuid) {
			var users = self.users().filter(function (user) {
				return user.uuid !== uuid;
			});

			self.users(users);
		};

		socket.on("connect", function () {
			self.localUser().isConnected(true);
		});
		socket.on("disconnect", function () {
			self.localUser().isConnected(false);
		});
		socket.on("reconnect", function () {
			self.localUser().isConnected(true);
		});

		socket.on("update", function (data) {
			update(data);
		});

		socket.on("who is there", function () {
			self.localUser().broadcast();
			broadcast();
		});

		socket.on("reconnect", function () {
			// The client has a different session ID after reconnect,
			// so we need to re-join the group.
			socket.emit(
				"join",
				{
					groupName: groupName,
					userUuid: self.localUser().uuid
				}
			);
			self.localUser().broadcast();
			broadcast();
		});

		socket.on("user disconnected", function (data) {
			removeUser(data);
		});

		socket.on("new round", function () {
			self.localUser().estimation(false);
		});
	};
})(window.EP = window.EP || {}, window.ko);

