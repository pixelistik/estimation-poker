"use strict";

var LocalUserFactory = function (User) {

    var LocalUser = function (socket) {
        var user = new User(socket);

        user.name.subscribe(function () {
            this.broadcast();
            this.saveToCookie();
        }.bind(user));

        user.estimation.subscribe(function () {
			this.broadcast();
		}.bind(user));

		user.isWatcher.subscribe(function () {
			this.broadcast();
		}.bind(user));

        socket.on("connect", function () {
			this.isConnected(true);
		}.bind(user));

		socket.on("disconnect", function () {
			this.isConnected(false);
		}.bind(user));

		socket.on("reconnect", function () {
			this.isConnected(true);
		}.bind(user));

        socket.on("new round", function () {
			this.estimation(false);
		}.bind(user));

        user.toggleWatcher = function () {
			this.isWatcher(!this.isWatcher());
		}.bind(user);

        return user;
    };

    return LocalUser;
};

module.exports = LocalUserFactory;
