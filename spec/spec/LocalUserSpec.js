var ko = require("knockout");
var Tools = require("../../client/js/tools.js");

Tools.readCookie = function () {
	return "stub cookie";
}

Tools.createCookie = function () { }

// socket.io stub
var io = {
	connect: function () {}
};

var windowStub = {
	location: "http://stub.example.com",
	prompt: jasmine.createSpy("prompt")
};
var SocketMock = require("../helpers/SocketMock.js");

var User = require("../../client/js/models/User.js")(ko, Tools);
var LocalUser = require("../../client/js/models/LocalUser.js")(User);

var socketMock;

beforeEach(function () {
	socketMock = new SocketMock();

	spyOn(io, "connect").and.returnValue(socketMock);
});

describe("LocalUser", function () {
	var localUser;

	beforeEach(function () {
		localUser = new LocalUser(socketMock);
	});

	it("should broadcast and save name changes", function () {
		spyOn(localUser, "broadcast");
		spyOn(localUser, "saveToCookie");

		localUser.name("my new name");

		expect(localUser.broadcast).toHaveBeenCalled();
		expect(localUser.saveToCookie).toHaveBeenCalled();
	});

	it("should broadcast estimation changes", function () {
		spyOn(localUser, "broadcast");

		localUser.estimation(2);

		expect(localUser.broadcast).toHaveBeenCalled();
	});

	it("should broadcast watcher state changes", function () {
		spyOn(localUser, "broadcast");

		localUser.isWatcher(true);

		expect(localUser.broadcast).toHaveBeenCalled();
	});

	it("should be able to toggle the watcher state", function () {
		localUser.isWatcher(false);

		localUser.toggleWatcher();
		expect(localUser.isWatcher()).toBeTruthy();

		localUser.toggleWatcher();
		expect(localUser.isWatcher()).toBeFalsy();
	});
});
