"use strict";

var PokerViewFactory = function (ko, Tools, User, io, window, LocalUser) {
	var PokerView = function (groupName) {
		var getAllEstimations = function () {
			return this.users()
				.concat(this.localUser())
				.filter(function (user) {
					return user.isWatcher() !== true;
				})
				.map(function (user) {
					return user.estimation();
				})
				.filter(function (estimation) {
					return estimation !== false;
				});
		}.bind(this);

		var getExistingUserByUuid = function (uuid) {
			return this.users().filter(function (user) {
				return user.uuid === uuid;
			})[0];
		}.bind(this);

		var socket = io.connect("/");

		this.pokerValues = ko.observableArray([0, 1, 2, 3, 5, 8, 13, 20, 40, 100]);
		var pokerValuesSubscription = this.pokerValues.subscribe(function () {
			broadcast();
		});

		this.pokerValueSets = [
			{
				title: "Scrum",
				values: [0, 1, 2, 3, 5, 8, 13, 20, 40, 100]
			},
			{
				title: "T-Shirt sizes",
				values: ["S", "M", "L", "XL"]
			}
		];

		this.initNewRound = function () {
			this.localUser().estimation(false);
			socket.emit("new round");
		};

		this.setPokerValues = function (valueSet) {
			socket.emit("set poker values", JSON.stringify(valueSet));

			this.initNewRound();
			this.pokerValues(valueSet.values);
		};

		this.promptForCustomPokerValues = function () {
			var currentRangePrefill = this.pokerValues().join(";");
			var customValues = window.prompt(
				"Enter your custom estimation range (semicolon separated)",
				currentRangePrefill
			);

			if (customValues === null) {
				return;
			}

			var preparedValues = customValues.split(";")
				.map(function (value) {
					return value.trim();
				})
				.filter(function (value) {
					return value !== "";
				});

			this.setPokerValues({
				values: preparedValues
			});
		};

		this.localUser = ko.observable(new LocalUser(socket));
		this.localUser().loadFromCookie();

		socket.emit(
			"join",
			{
				groupName: groupName,
				userUuid: this.localUser().uuid
			}
		);

		this.localUser().broadcast();

		this.users = ko.observableArray([]);

		this.storyTitle = ko.observable("");
		var storySubscription = this.storyTitle.subscribe(function () {
			broadcast();
		});

		// http://stackoverflow.com/a/6102340/376138
		this.highestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.max.apply(null, estimations);

			if(result === -Infinity) {
				return false;
			}
			return result;
		}.bind(this));

		this.lowestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.min.apply(null, estimations);

			if(result === Infinity) {
				return false;
			}
			return result;
		});

		this.estimationsComplete = ko.computed(function () {
			return this.users()
				.concat(this.localUser())
				.filter(function (user) {
					return user.isWatcher() !== true &&
						user.estimation() === false;
				}).length === 0 &&
				getAllEstimations().length > 0;
		}.bind(this));

		this.roundIsInProgress = ko.computed(function () {
			var estimationsCount = getAllEstimations().length;

			return estimationsCount > 0 && !this.estimationsComplete();
		}.bind(this));

		this.statusTitle = ko.computed(function () {
			var statusPrefix = "";

			if (this.estimationsComplete()) {
				statusPrefix = "✓ ";
			}

			return statusPrefix + "Estimation Poker";
		}.bind(this));

		this.mailtoHref = ko.pureComputed(function () {
			return Tools.safeMailtoHref(
				"Estimation Poker URL",
				window.location
			);
		});

		this.displaySharingQrCode = ko.observable(false);

		this.toggleDisplaySharingQrCode = function () {
			this.displaySharingQrCode(!this.displaySharingQrCode());
		};

		this.toggleWatcher = function () {
			this.localUser().isWatcher(!this.localUser().isWatcher());
		};

		var broadcast = function () {
			var me = {
				storyTitle: this.storyTitle(),
				pokerValues: this.pokerValues()
			};
			socket.emit("update", JSON.stringify(me));
		}.bind(this);

		var update = function (data) {
			var received = JSON.parse(data);

			if(received.uuid !== undefined) {
				// A user object was received:

				if(received.uuid === this.localUser().uuid) {
					return;
				}

				var user = getExistingUserByUuid(received.uuid);

				if (!user) {
					 user = new User(socket, received.uuid);
					 this.users.push(user);
				}

				user.name(received.name);
				user.estimation(received.estimation);
				user.isWatcher(received.isWatcher);
			} else {
				// A story object was received:
				storySubscription.isDisposed = true;
				pokerValuesSubscription.isDisposed = true;

				this.storyTitle(received.storyTitle);
				this.pokerValues(received.pokerValues);

				storySubscription.isDisposed = false;
				pokerValuesSubscription.isDisposed = false;
			}
		}.bind(this);

		var removeUser = function (uuid) {
			var users = this.users().filter(function (user) {
				return user.uuid !== uuid;
			});

			this.users(users);
		}.bind(this);

		socket.on("update", function (data) {
			update(data);
		}.bind(this));

		socket.on("who is there", function () {
			this.localUser().broadcast();
			broadcast();
		}.bind(this));

		socket.on("reconnect", function () {
			// The client has a different session ID after reconnect,
			// so we need to re-join the group.
			socket.emit(
				"join",
				{
					groupName: groupName,
					userUuid: this.localUser().uuid
				}
			);
			this.localUser().broadcast();
			broadcast();
		}.bind(this));

		socket.on("user disconnected", function (data) {
			removeUser(data);
		});

		socket.on("new round", function () {
			this.localUser().estimation(false);
		}.bind(this));
	};

	return PokerView;
};

module.exports = PokerViewFactory;
