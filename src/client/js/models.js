(function(EP) {
	"use strict";

	EP.User = function(socket, uuid) {
		var self = this;

		self.uuid = uuid || EP.Tools.uuid();
		self.name = ko.observable("");
		self.estimation = ko.observable(false);

		self.broadcast = function () {
			console.log("broadcasting user");
			console.log(ko.toJSON(self));
			socket.emit('update', ko.toJSON(self));
		}

		self.loadFromCookie = function() {
			if(
				$.cookie("ep.user.name") &&
				$.cookie("ep.user.uuid")
			) {
				self.name($.cookie("ep.user.name"));
				self.uuid = $.cookie("ep.user.uuid");
			}
		};

		self.saveToCookie = function() {
			$.cookie("ep.user.name", self.name());
			$.cookie("ep.user.uuid", self.uuid);
		};
	};

	EP.PokerView = function (groupName) {
		var self = this;

		var getAllEstimations = function() {
			var estimations = $.map(self.users(), function(val, i) {
				if(val.estimation()) {
					return val.estimation();
				}
			});
			if(self.localUser().estimation()) {
				estimations.push(self.localUser().estimation());
			}
			return estimations;
		};

		var getExistingUserByUuid = function (uuid) {
			for(var i=0; i < self.users().length; i++) {
				if (self.users()[i].uuid === uuid) {
					return self.users()[i];
				}
			}
			return false;
		}

		var socket = io.connect('http://localhost:8080');
		socket.emit('join', {groupName: groupName});

		socket.on('update', function (data) {
			self.update(data);
		});

		socket.on('who is there', function () {
			self.localUser().broadcast();
		});

		self.localUser = ko.observable(new EP.User(socket));
		self.localUser().loadFromCookie();

		self.localUser().name.subscribe(function() {
			self.localUser().broadcast();
			self.localUser().saveToCookie();
		});

		self.users = ko.observableArray([]);

		// http://stackoverflow.com/a/6102340/376138
		self.highestEstimation = ko.computed(function() {
			var estimations = getAllEstimations();

			var result = Math.max.apply(null, estimations);

			if(result === -Infinity) {
				return false;
			}
			return result;
		});

		self.lowestEstimation = ko.computed(function() {
			var estimations = getAllEstimations();

			var result = Math.min.apply(null, estimations);

			if(result === Infinity) {
				return false;
			}
			return result;
		});

		self.estimationsComplete = ko.computed(function() {
			for(var i=0; i < self.users().length; i++) {
				if (self.users()[i].estimation() === false) {
					return false;
				}
			}
			if(self.localUser().estimation() === false) {
				return false;
			}
			return true;
		});

		self.update = function (data) {
			var received = JSON.parse(data);
			console.log(received);

			var user = getExistingUserByUuid(received.uuid);

			if (!user) {
				 user = new EP.User(socket, received.uuid);
				 self.users.push(user);
			}

			user.name(received.name);
			user.estimation(received.estimation);
		}
	}
})(window.EP = window.EP || {});
