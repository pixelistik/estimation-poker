describe("Binding", function () {
	describe("editableText", function () {
		var fixture, model, observable;

		beforeEach(function () {
			fixture = $('<div data-bind="editableText: prop"></div>');

			observable = ko.observable("text");
			model = {prop: observable};

			ko.applyBindings(model, fixture[0]);
		});

		it("should show the display by default", function () {
			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should show the form when clicked", function () {
			$(".et-display", fixture).trigger("click");
			expect($(".et-display", fixture).css("display")).toEqual("none");
			expect($(".et-form",    fixture).css("display")).not.toEqual("none");
		});

		it("should update the value using the button", function () {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");
			$("button", fixture).trigger("click");

			expect(model.prop).toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should update the value using the ENTER key", function () {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");

			e = generateKeypressEvent(13); // ENTER key
			fixture[0].querySelector("input").dispatchEvent(e);

			expect(model.prop).toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should update the label when the value changes", function () {
			model.prop("changed value");

			expect($(".et-label", fixture).text()).toEqual("changed value");
			expect($("input",     fixture).val() ).toEqual("changed value");
		});

		it("should stop editing using the ESC key", function () {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");

			e = generateKeypressEvent(27); //ESC key
			fixture[0].querySelector("input").dispatchEvent(e);

			expect(model.prop).not.toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});
	});

	// Create a keypress event for testing
	// see http://stackoverflow.com/a/23700583/376138
	function generateKeypressEvent(code) {
		var oEvent = document.createEvent('KeyboardEvent');

		// Chromium Hack: filter this otherwise Safari will complain
		if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
			Object.defineProperty(oEvent, 'keyCode', {
				get: function () {
					return this.keyCodeVal;
				}
			});
			Object.defineProperty(oEvent, 'which', {
				get: function () {
					return this.keyCodeVal;
				}
			});
		}

		if (oEvent.initKeyboardEvent) {
			oEvent.initKeyboardEvent("keypress", true, true, document.defaultView, false, false, false, false, code, code);
		} else {
			oEvent.initKeyEvent("keypress", true, true, document.defaultView, false, false, false, false, code, 0);
		}

		oEvent.keyCodeVal = code;

		if (oEvent.keyCode !== code) {
			console.log("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ") -> " + code);
		}

		return oEvent;
	}
});

