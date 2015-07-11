var assert = require("assert")
var Nightmare = require("nightmare");

describe("Data transmission", function () {
	this.timeout(5000);
	var alice;
	var bob;

	beforeEach(function () {
		alice = new Nightmare()
			.viewport(1024, 768)
			.goto('http://localhost:5000/#browsertest')
			.wait('.et-hint');

		bob = new Nightmare()
			.viewport(1024, 768)
			.goto('http://localhost:5000/#browsertest')
			.wait('.et-hint');
	});

	it("should display the other users name", function (done) {
		alice.click(".username .et-label")
			.wait(".username input")
			.evaluate(function () {document.querySelector(".username input").value = "Alice"})
			.click(".username .et-form .btn")
			.wait(2000)
			.run();

		bob.wait(1000)
			.evaluate(
				function () {
					return document.querySelector('.remote-users .name').textContent;
				},
				function (text) {
					assert.equal(text, "Alice");
				}
			)
			.run(done);
	});

	it("should display the story title set by the other user", function (done) {
		alice.click(".story-title .et-label")
			.wait(".story-title input")
			.evaluate(function () {document.querySelector(".story-title input").value = "Test Story"})
			.click(".story-title .et-form .btn")
			.wait(2000)
			.run();

		bob.wait(1000)
			.evaluate(
				function () {
					return document.querySelector('.story-title .et-label').textContent;
				},
				function (text) {
					assert.equal(text, "Test Story");
				}
			)
			.run(done);
	});
});
