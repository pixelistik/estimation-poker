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

	EP.PokerView = function (groupName) {
		var self = this;

		var getAllEstimations = function () {
			return self.users()
				.concat(self.localUser())
				.filter(function (user) {
					return true;
				})
				.map(function (user) {
					return user.estimation();
				})
				.filter(function (estimation) {
					return estimation !== false;
				});
		};

		var getExistingUserByUuid = function (uuid) {
			return self.users().filter(function (user) {
				return user.uuid === uuid;
			})[0];
		};

		var socket = io.connect("/");

		self.pokerValues = ko.observableArray([0, 1, 2, 3, 5, 8, 13, 20, 40, 100]);
		var pokerValuesSubscription = self.pokerValues.subscribe(function () {
			broadcast();
		});

		self.pokerValueSets = [
			{
				title: "Scrum",
				values: [0, 1, 2, 3, 5, 8, 13, 20, 40, 100]
			},
			{
				title: "T-Shirt sizes",
				values: ["S", "M", "L", "XL"]
			}
		];

		self.initNewRound = function () {
			self.localUser().estimation(false);
			socket.emit("new round");
		};

		self.setPokerValues = function (valueSet) {
			socket.emit("set poker values", JSON.stringify(valueSet));

			self.initNewRound();
			self.pokerValues(valueSet.values);
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

		self.roundIsInProgress = ko.computed(function () {
			var estimationsCount = getAllEstimations().length;

			return estimationsCount > 0 && !self.estimationsComplete();
		});

		self.statusTitle = ko.computed(function () {
			var statusPrefix = "";

			if (self.estimationsComplete()) {
				statusPrefix = "✓ ";
			}

			return statusPrefix + "Estimation Poker";
		});

		self.mailtoHref = ko.pureComputed(function () {
			return EP.Tools.safeMailtoHref(
				"Estimation Poker URL",
				window.location
			);
		});

		self.displaySharingQrCode = ko.observable(false);

		self.toggleDisplaySharingQrCode = function () {
			self.displaySharingQrCode(!self.displaySharingQrCode());
		};

		var broadcast = function () {
			var me = {
				storyTitle: self.storyTitle(),
				pokerValues: self.pokerValues()
			};
			socket.emit("update", JSON.stringify(me));
		};

		var update = function (data) {
			var received = JSON.parse(data);

			if(received.uuid !== undefined) {
				// A user object was received:

				if(received.uuid === self.localUser().uuid) {
					return;
				}

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
				pokerValuesSubscription.isDisposed = true;

				self.storyTitle(received.storyTitle);
				self.pokerValues(received.pokerValues);

				storySubscription.isDisposed = false;
				pokerValuesSubscription.isDisposed = false;
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

