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
	});
});
