describe("Model", function () {
	// socket.io stub
	window.io = {
		connect: function () {}
	};

	var socketMock;

	beforeEach(function () {
		// Mock the essential parts of socket.io by
		// returning a mock socket on io.connect().
		socketMock = {
			handlers: {}
		};

		socketMock.on = jasmine.createSpy("on")
			.and.callFake(function (eventName, handler) {
				// Store references to all callback functions:
				this.handlers[eventName] = handler;
			});

		socketMock.emit = jasmine.createSpy("emit");

		spyOn(io, "connect").and.returnValue(socketMock);
	});

	describe("User", function () {
		var user;

		beforeEach(function () {
			user = new EP.User();
		});

		it("should instantiate", function () {
			expect(user).toBeDefined();
		});

		it("should use a passed UUID", function () {
			user = new EP.User({}, "a-fake-uuid");
			expect(user.uuid).toEqual("a-fake-uuid");
		});

		it("should generate a UUID if none is passed", function () {
			spyOn(EP.Tools, "uuid").and.returnValue("a-mock-uuid");
			user = new EP.User();
			expect(user.uuid).toEqual("a-mock-uuid");
		});

		it("should be able to be loaded from cookie", function () {
			spyOn($, "cookie").and.callFake(function (param) {
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
			spyOn($, "cookie");

			user.name("test user");
			user.uuid = "test user";

			user.saveToCookie();

			expect($.cookie.calls.allArgs()).toEqual([["ep.user.name", "test user"], ["ep.user.uuid", "test user"]]);
		});
	});

	describe("PokerView", function () {
		var user;

		beforeEach(function () {
			pokerView = new EP.PokerView();
		});

		it("should instantiate", function () {
			expect(pokerView).toBeDefined();
		});

		describe("Highest and lowest estimation", function () {
			it("should return false when there are no estimations", function () {
				expect(pokerView.highestEstimation()).toBeFalsy();
				expect(pokerView.lowestEstimation()).toBeFalsy();

				pokerView.users.push(new EP.User());
				expect(pokerView.highestEstimation()).toBeFalsy();
				expect(pokerView.lowestEstimation()).toBeFalsy();
			});

			it("should return the same value if there is only one estimation", function () {
				var user = new EP.User();
				user.estimation(3);
				pokerView.users.push(user);
				expect(pokerView.highestEstimation()).toEqual(3);
				expect(pokerView.lowestEstimation()).toEqual(3);
			});

			it("should return the correct value if one user has no estimation yet", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(5);

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.highestEstimation()).toEqual(5);
				expect(pokerView.lowestEstimation()).toEqual(5);
			});

			it("should return the correct values with two users", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

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
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(0);
				user2.estimation(3);

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.highestEstimation()).toEqual(3);
				expect(pokerView.lowestEstimation()).toEqual(0);
			});

			it("should include the local user into the calculation", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

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
		});

		describe("Completed estimations", function () {
			it("should correctly tell if no estimations are there", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if one remote user is missing", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if the local user is missing", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);

				pokerView.users.push(user1);
				pokerView.localUser(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if all estimations are there", function () {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);
				user2.estimation(1);

				pokerView.users.push(user1);
				pokerView.localUser(user2);

				expect(pokerView.estimationsComplete()).toBeTruthy();
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
		});

		describe("Remote users", function () {
			describe("disconnect", function () {
				it("should remove a remote user", function () {
					pokerView = new EP.PokerView();

					var user1 = new EP.User();
					user1.uuid = "a-user-to-remove"

					pokerView.users.push(user1);
					expect(pokerView.users().length).toEqual(1);

					// Manually call the event handler
					socketMock.handlers["user disconnected"]("a-user-to-remove");

					expect(pokerView.users().length).toEqual(0);
				});
			});
		});

		describe("Data update", function () {
			it("should update the users when user data is received", function () {
				var user1 = new EP.User();
				user1.uuid = "a-test-user";

				pokerView.users.push(user1);

				var storyTitleCache = pokerView.storyTitle();

				var data = {
					uuid: "a-test-user",
					estimation: 99
				};
				socketMock.handlers["update"](JSON.stringify(data));

				expect(pokerView.users()[0].estimation()).toEqual(99);

				// Story should not be touched
				expect(pokerView.storyTitle()).toEqual(storyTitleCache);
			});

			it("should update the story when story data is received", function () {
				var user1 = new EP.User();

				pokerView.users.push(user1);

				var usersCache = pokerView.users();

				var data = {
					storyTitle: "a test story title"
				};
				socketMock.handlers["update"](JSON.stringify(data));

				expect(pokerView.storyTitle()).toEqual("a test story title");

				// Users should not be touched
				expect(pokerView.users()).toEqual(usersCache);
			});
		});

		describe("Reset", function () {
			it("triggered locally: should send the event and reset local user's estimation", function () {
				var user1 = new EP.User();
				user1.estimation(3);
				pokerView.localUser(user1);

				pokerView.initNewRound();

				expect(pokerView.localUser().estimation()).toEqual(false);
				expect(socketMock.emit).toHaveBeenCalledWith("new round");
			});

			it("triggered by event: should reset local user's estimation", function () {
				var user1 = new EP.User();
				user1.estimation(3);
				pokerView.localUser(user1);

				socketMock.handlers["new round"]();

				expect(pokerView.localUser().estimation()).toEqual(false);
			});
		});
	});
});

