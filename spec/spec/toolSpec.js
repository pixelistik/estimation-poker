describe("Tool", function () {
	describe("Base64 ID", function () {
		it("should return a string with the correct length", function () {
			var result = EP.Tools.base64Id(6);
			expect(result.length).toEqual(6);

			result = EP.Tools.base64Id(4);
			expect(result.length).toEqual(4);
		});

		it("should return a string containing only a-z, A-Z, 0-9", function () {
			var result = EP.Tools.base64Id(200);

			expect(/[^a-zA-Z0-9]/.test(result)).toBeFalsy();
		});

		it("should use the first and last char, too (no off-by-one error)", function () {
			var result = EP.Tools.base64Id(64000);

			expect(/[a]/.test(result)).toBeTruthy();
			expect(/[9]/.test(result)).toBeTruthy();
		});
	});
});
