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

        return user;
    };

    return LocalUser;
}

module.exports = LocalUserFactory;
