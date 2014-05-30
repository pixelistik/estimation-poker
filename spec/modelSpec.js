describe("Model", function() {
	window.io = {
		connect: function() {
			return {
				emit: function() {
					return null;
				},
				on: function() {
					return null;
				}
			};
		}
	};
	describe("User", function() {
		var user;

		beforeEach(function() {
			user = new EP.User();
		});

		it("should instantiate", function() {
			expect(user).toBeDefined();
		});

		it("should use a passed UUID", function() {
			user = new EP.User({}, "a-fake-uuid");
			expect(user.uuid).toEqual("a-fake-uuid");
		});

		it("should generate a UUID if none is passed", function() {
			spyOn(EP.Tools, "uuid").and.returnValue("a-mock-uuid");
			user = new EP.User();
			expect(user.uuid).toEqual("a-mock-uuid");
		});
	});

	describe("PokerView", function() {
		var user;

		beforeEach(function() {
			pokerView = new EP.PokerView();
		});

		it("should instantiate", function() {
			expect(pokerView).toBeDefined();
		});

		describe("Highest and lowest estimation", function() {
			it("should return false when there are no estimations", function() {
				expect(pokerView.highestEstimation()).toBeFalsy();
				expect(pokerView.lowestEstimation()).toBeFalsy();

				pokerView.users.push(new EP.User());
				expect(pokerView.highestEstimation()).toBeFalsy();
				expect(pokerView.lowestEstimation()).toBeFalsy();
			});

			it("should return the same value if there is only one estimation", function() {
				var user = new EP.User();
				user.estimation(3);
				pokerView.users.push(user);
				expect(pokerView.highestEstimation()).toEqual(3);
				expect(pokerView.lowestEstimation()).toEqual(3);
			});

			it("should return the correct value if one user has no estimation yet", function() {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(5);

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.highestEstimation()).toEqual(5);
				expect(pokerView.lowestEstimation()).toEqual(5);
			});

			it("should return the correct values with two users", function() {
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

			it("should include the local user into the calculation", function() {
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

		describe("Completed estimations", function() {
			it("should correctly tell if no estimations are there", function() {
				var user1 = new EP.User();
				var user2 = new EP.User();

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if one remote user is missing", function() {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);

				pokerView.users.push(user1);
				pokerView.users.push(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if the local user is missing", function() {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);

				pokerView.users.push(user1);
				pokerView.localUser(user2);

				expect(pokerView.estimationsComplete()).toBeFalsy();
			});

			it("should correctly tell if all estimations are there", function() {
				var user1 = new EP.User();
				var user2 = new EP.User();

				user1.estimation(1);
				user2.estimation(1);

				pokerView.users.push(user1);
				pokerView.localUser(user2);

				expect(pokerView.estimationsComplete()).toBeTruthy();
			});
		});
	});
});
