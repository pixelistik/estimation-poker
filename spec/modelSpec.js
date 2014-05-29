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
