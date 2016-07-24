var ko = require("knockout");
var Tools = require("../../client/js/tools.js");

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
var PokerView = require("../../client/js/models/PokerView.js")(ko, Tools, User, io, windowStub, LocalUser);

var socketMock;

beforeEach(function () {
	socketMock = new SocketMock();

	spyOn(io, "connect").and.returnValue(socketMock);
});

describe("User", function () {
	var user;

	beforeEach(function () {
		user = new User();
	});

	it("should instantiate", function () {
		expect(user).toBeDefined();
	});

	it("should use a passed UUID", function () {
		user = new User({}, "a-fake-uuid");
		expect(user.uuid).toEqual("a-fake-uuid");
	});

	it("should generate a UUID if none is passed", function () {
		spyOn(Tools, "uuid").and.returnValue("a-mock-uuid");
		user = new User();
		expect(user.uuid).toEqual("a-mock-uuid");
	});

	it("should show a generic display name when no name is set", function () {
		expect(user.displayName()).toEqual("new user");

		user.name("testuser");
		expect(user.displayName()).toEqual("testuser");

		user.name("");
		expect(user.displayName()).toEqual("new user");
	});

	it("should be able to be loaded from cookie", function () {
		spyOn(Tools, "readCookie").and.callFake(function (param) {
			var returnValues = {
				"ep.user.name": "a test user",
				"ep.user.uuid": "some-test-uuid",
			};
			return returnValues[param];
		});

		user.loadFromCookie();

		expect(user.name()).toEqual("a test user");
		expect(user.uuid  ).toEqual("some-test-uuid");
	});

	it("should be able to be saved to a cookie", function () {
		spyOn(Tools, "createCookie");

		user.name("test user");
		user.uuid = "test user";

		user.saveToCookie();

		expect(Tools.createCookie.calls.allArgs()).toEqual([["ep.user.name", "test user"], ["ep.user.uuid", "test user"]]);
	});

	it("should be able to be a watcher", function () {
		user.estimation(2);
		user.isWatcher(true);

		expect(user.estimation()).toBeFalsy();
		expect(user.isWatcher()).toBeTruthy();
	});
});
