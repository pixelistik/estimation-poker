describe("Model", function() {

	describe("User", function() {
		var user;

		beforeEach(function() {
			user = new EP.User();
		});

		it("should instantiate", function() {
			expect(user).toBeDefined();
		});
	});
});
