(function(EP) {
	"use strict";

	EP.User = function(socket, uuid) {
		var self = this;

		self.uuid = uuid || EP.Tools.uuid();
		self.name = ko.observable("");
		self.estimation = ko.observable();

		self.broadcast = function () {
			console.log("broadcasting user");
			console.log(ko.toJSON(self));
			socket.emit('update', ko.toJSON(self));
		}
	};

	EP.PokerView = function (groupName) {
		var self = this;

		var socket = io.connect('http://localhost:8080');
		socket.emit('join', {groupName: groupName});

		socket.on('update', function (data) {
			self.update(data);
		});

		self.localUser = ko.observable(new EP.User(socket));

		self.users = ko.observableArray([]);

		// http://stackoverflow.com/a/6102340/376138
		self.highestEstimation = ko.computed(function() {
			var estimations = $.map(self.users(), function(val, i) {
				return val.estimation();
			});
			return Math.max.apply(null, estimations);
		});

		self.lowestEstimation = ko.computed(function() {
			var estimations = $.map(self.users(), function(val, i) {
				return val.estimation();
			});
			return Math.min.apply(null, estimations);
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

		var getExistingUserByUuid = function (uuid) {
			for(var i=0; i < self.users().length; i++) {
				if (self.users()[i].uuid === uuid) {
					return self.users()[i];
				}
			}
			return false;
		}
	}
})(window.EP = window.EP || {});
