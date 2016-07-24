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

describe("PokerView", function () {
var user;

beforeEach(function () {
	pokerView = new PokerView("test-group-name");
});

it("should instantiate", function () {
	expect(pokerView).toBeDefined();
});

it("should be able to broadcast the state when requested by new users", function () {
	spyOn(pokerView.localUser(), "broadcast");

	socketMock.callHandler("who is there");

	expect(pokerView.localUser().broadcast).toHaveBeenCalled();
});

describe("Highest and lowest estimation", function () {
	it("should return false when there are no estimations", function () {
		expect(pokerView.highestEstimation()).toBeFalsy();
		expect(pokerView.lowestEstimation()).toBeFalsy();

		pokerView.users.push(new User());
		expect(pokerView.highestEstimation()).toBeFalsy();
		expect(pokerView.lowestEstimation()).toBeFalsy();
	});

	it("should return the same value if there is only one estimation", function () {
		var user = new User();
		user.estimation(3);
		pokerView.users.push(user);
		expect(pokerView.highestEstimation()).toEqual(3);
		expect(pokerView.lowestEstimation()).toEqual(3);
	});

	it("should return the correct value if one user has no estimation yet", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(5);

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		expect(pokerView.highestEstimation()).toEqual(5);
		expect(pokerView.lowestEstimation()).toEqual(5);
	});

	it("should return the correct values with two users", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.estimation(3);

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		expect(pokerView.highestEstimation()).toEqual(3);
		expect(pokerView.lowestEstimation()).toEqual(1);

		pokerView.users()[0].estimation(8);

		expect(pokerView.highestEstimation()).toEqual(8);
		expect(pokerView.lowestEstimation()).toEqual(3);
	});

	it("should return 0 correctly as minimum", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(0);
		user2.estimation(3);

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		expect(pokerView.highestEstimation()).toEqual(3);
		expect(pokerView.lowestEstimation()).toEqual(0);
	});

	it("should include the local user into the calculation", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.estimation(3);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.highestEstimation()).toEqual(3);
		expect(pokerView.lowestEstimation()).toEqual(1);

		pokerView.users()[0].estimation(8);

		expect(pokerView.highestEstimation()).toEqual(8);
		expect(pokerView.lowestEstimation()).toEqual(3);
	});

	it("should ignore a watcher with two users", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.estimation(3);

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		user2.isWatcher(true);

		expect(pokerView.highestEstimation()).toEqual(1);
		expect(pokerView.lowestEstimation()).toEqual(1);
	});

	it("should ignore the local user as a watcher", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.estimation(3);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		user2.isWatcher(true);

		expect(pokerView.highestEstimation()).toEqual(1);
		expect(pokerView.lowestEstimation()).toEqual(1);
	});
});

describe("Completed estimations", function () {
	it("should correctly tell if no estimations are there", function () {
		var user1 = new User();
		var user2 = new User();

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		expect(pokerView.estimationsComplete()).toBeFalsy();
	});

	it("should correctly tell if one remote user is missing", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);

		pokerView.users.push(user1);
		pokerView.users.push(user2);

		expect(pokerView.estimationsComplete()).toBeFalsy();
	});

	it("should correctly tell if the local user is missing", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.estimationsComplete()).toBeFalsy();
	});

	it("should correctly tell if all estimations are there", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.estimation(1);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.estimationsComplete()).toBeTruthy();
	});

	it("should determine estimations as complete if remote user is watcher", function () {
		var user1 = new User();
		var user2 = new User();

		user1.isWatcher(true);
		user2.estimation(1);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.estimationsComplete()).toBeTruthy();
	});

	it("should determine estimations as complete if local user is watcher", function () {
		var user1 = new User();
		var user2 = new User();

		user1.estimation(1);
		user2.isWatcher(true);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.estimationsComplete()).toBeTruthy();
	});

	it("should determine estimations as incomplete if there are only watchers", function () {
		var user1 = new User();
		var user2 = new User();

		user1.isWatcher(true);
		user2.isWatcher(true);

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		expect(pokerView.estimationsComplete()).toBeFalsy();
	});

	it("should tell if the round is in progress", function () {
		expect(pokerView.roundIsInProgress()).toBeFalsy();

		var user1 = new User();
		var user2 = new User();

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		user1.estimation(1);

		expect(pokerView.roundIsInProgress()).toBeTruthy();

		user2.estimation(1);

		expect(pokerView.roundIsInProgress()).toBeFalsy();
	});

	it("should show the round status depending on progress", function () {
		expect(pokerView.statusTitle()).toEqual("Estimation Poker");

		var user1 = new User();
		var user2 = new User();

		pokerView.users.push(user1);
		pokerView.localUser(user2);

		user1.estimation(1);

		expect(pokerView.statusTitle()).toEqual("Estimation Poker");

		user2.estimation(1);

		expect(pokerView.statusTitle()).toEqual("✓ Estimation Poker");
	});
});

describe("Local user", function () {
	it("should broadcast and save to cookie when the name changes", function () {
		var localUser = pokerView.localUser();
		spyOn(localUser, "broadcast");
		spyOn(localUser, "saveToCookie");

		pokerView.localUser().name("An updated test name");

		expect(localUser.broadcast).toHaveBeenCalled();
		expect(localUser.saveToCookie).toHaveBeenCalled();
	});

	it("should know its current connection state", function () {
		var localUser = pokerView.localUser();

		expect(localUser.isConnected()).toBeFalsy();

		socketMock.callHandler("connect");
		expect(localUser.isConnected()).toBeTruthy();

		socketMock.callHandler("disconnect");
		expect(localUser.isConnected()).toBeFalsy();

		socketMock.callHandler("reconnect");
		expect(localUser.isConnected()).toBeTruthy();
	});

	it("should be able to reconnect", function () {
		var localUser = pokerView.localUser();
		localUser.uuid = "re-join-test"

		socketMock.emit.calls.reset();
		localUser.joinGroup("test-group-name")

		expect(socketMock.emit.calls.allArgs()[0][0]).toEqual("join");
		expect(socketMock.emit.calls.allArgs()[0][1].groupName).toEqual("test-group-name");
		expect(socketMock.emit.calls.allArgs()[0][1].userUuid).toEqual("re-join-test");
	});

	it("should re-join the group after reconnect", function () {
		var localUser = pokerView.localUser();

		spyOn(localUser, "joinGroup");
		spyOn(localUser, "broadcast");

		socketMock.emit.calls.reset();
		socketMock.callHandler("reconnect");

		expect(localUser.joinGroup).toHaveBeenCalledWith("test-group-name");
		expect(localUser.broadcast).toHaveBeenCalled();
	});
});

describe("Remote users", function () {
	describe("connect", function () {
		it("should add a new user", function () {
			socketMock.callHandler("update", '{"uuid": "user-one"}');

			expect(pokerView.users().length).toEqual(1);
			expect(pokerView.users()[0].uuid).toEqual("user-one");
		});

		it("should not add a known user again", function () {
			socketMock.callHandler("update", '{"uuid": "user-one"}');
			socketMock.callHandler("update", '{"uuid": "user-one"}');

			expect(pokerView.users().length).toEqual(1);
			expect(pokerView.users()[0].uuid).toEqual("user-one");
		});
	});

	describe("disconnect", function () {
		it("should remove a remote user", function () {
			pokerView = new PokerView();

			var user1 = new User();
			user1.uuid = "a-user-to-remove"

			pokerView.users.push(user1);
			expect(pokerView.users().length).toEqual(1);

			// Manually call the event handler
			socketMock.callHandler("user disconnected", "a-user-to-remove");

			expect(pokerView.users().length).toEqual(0);
		});
	});
});

describe("Data update", function () {
	it("should update the users when user data is received", function () {
		var user1 = new User();
		user1.uuid = "a-test-user";

		pokerView.users.push(user1);

		var storyTitleCache = pokerView.storyTitle();

		var data = {
			uuid: "a-test-user",
			estimation: 99
		};
		socketMock.callHandler("update", JSON.stringify(data));

		expect(pokerView.users()[0].estimation()).toEqual(99);

		// Story should not be touched
		expect(pokerView.storyTitle()).toEqual(storyTitleCache);
	});

	it("should ignore updates about the local user", function () {
		var user = new User();
		user.uuid ="the-local-user";

		pokerView.localUser(user);

		var data = {
			uuid: "the-local-user",
			estimation: 99
		};
		socketMock.callHandler("update", JSON.stringify(data));

		// Local User should be untouched
		expect(pokerView.localUser()).toEqual(user);

		// Local User should not be added to the remote Users
		expect(pokerView.users().length).toEqual(0);
	});

	it("should update the story when story data is received", function () {
		var user1 = new User();

		pokerView.users.push(user1);

		var usersCache = pokerView.users();

		var data = {
			storyTitle: "a test story title"
		};
		socketMock.callHandler("update", JSON.stringify(data));

		expect(pokerView.storyTitle()).toEqual("a test story title");

		// Users should not be touched
		expect(pokerView.users()).toEqual(usersCache);
	});

	it("should broadcast the story title when changed locally", function () {
		pokerView.storyTitle("locally updated title");
		expect(socketMock.emit).toHaveBeenCalledWith( 'update', '{"storyTitle":"locally updated title","pokerValues":[0,1,2,3,5,8,13,20,40,100]}');
	});

	it("should NOT re-broadcast the story title when changed remotely", function () {
		socketMock.callHandler("update", '{"storyTitle": "remotely updated title"}');
		expect(socketMock.emit).not.toHaveBeenCalledWith('update', '{"storyTitle":"remotely updated title"}');

		// Re-test local change, in case we broke the subscription
		pokerView.storyTitle("locally updated title");
		expect(socketMock.emit).toHaveBeenCalledWith( 'update', '{"storyTitle":"locally updated title"}');
	});

	it("should not handle any socket events before initialisation", function () {
		socketMock.on = jasmine.createSpy("on")
			.and.callFake(function (eventName, handler) {
				// Call connect handler immediately.
				// This triggered an undefined error, when the
				// initialisation had not finished yet.
				if (eventName === "connect") {
					handler();
				}
			});

		pokerView = new PokerView();
	});
});

describe("Reset", function () {
	it("triggered locally: should send the event and reset local user's estimation", function () {
		var user1 = new User();
		user1.estimation(3);
		pokerView.localUser(user1);

		pokerView.initNewRound();

		expect(pokerView.localUser().estimation()).toEqual(false);
		expect(socketMock.emit).toHaveBeenCalledWith("new round");
	});

	it("triggered by event: should reset local user's estimation", function () {
		var user1 = new LocalUser(socketMock);
		user1.estimation(3);
		pokerView.localUser(user1);

		socketMock.callHandler("new round");

		expect(pokerView.localUser().estimation()).toEqual(false);
	});
});

describe("Sharing options", function () {
	describe("Mailto link", function () {
		it("should use the safe mailto link tool", function () {
			spyOn(Tools, "safeMailtoHref").and.returnValue("safe-mailto");

			expect(pokerView.mailtoHref()).toBe("safe-mailto");
		});
	});

	it("should be able to toggle the QR code display", function () {
		pokerView.displaySharingQrCode(false);

		pokerView.toggleDisplaySharingQrCode();
		expect(pokerView.displaySharingQrCode()).toBeTruthy();

		pokerView.toggleDisplaySharingQrCode();
		expect(pokerView.displaySharingQrCode()).toBeFalsy();
	});
});

describe("Custom value set", function () {
	it("should use the entered values as Poker values", function () {
		windowStub.prompt.and.returnValue("One;Two;Three");
		pokerView.promptForCustomPokerValues();

		expect(pokerView.pokerValues()).toEqual(["One", "Two", "Three"]);
	});

	it("should trim any whitespace", function () {
		windowStub.prompt.and.returnValue("  One;Two ; Three  ");
		pokerView.promptForCustomPokerValues();

		expect(pokerView.pokerValues()).toEqual(["One", "Two", "Three"])
	});

	it("should ignore empty elements", function () {
		windowStub.prompt.and.returnValue("One;Two;; ");
		pokerView.promptForCustomPokerValues();

		expect(pokerView.pokerValues()).toEqual(["One", "Two"])
	});

	it("should ignore a cancelled prompt", function () {
		spyOn(pokerView, "initNewRound");
		windowStub.prompt.and.returnValue(null);

		pokerView.promptForCustomPokerValues();

		expect(pokerView.initNewRound).not.toHaveBeenCalled();
	})

	it("should pre-fill the prompt with the current value set", function () {
		pokerView.promptForCustomPokerValues();
		expect(windowStub.prompt).toHaveBeenCalledWith(
			"Enter your custom estimation range (semicolon separated)",
			"0;1;2;3;5;8;13;20;40;100"
		);

		pokerView.pokerValues(["Test 1", "Test 2"])

		pokerView.promptForCustomPokerValues();
		expect(windowStub.prompt).toHaveBeenCalledWith(
			"Enter your custom estimation range (semicolon separated)",
			"Test 1;Test 2"
		);
	});
})
});
