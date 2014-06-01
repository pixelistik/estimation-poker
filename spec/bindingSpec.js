describe("Binding", function() {
	describe("editableText", function() {
		var fixture, model, observable;

		beforeEach(function() {
			fixture = $('<div data-bind="editableText: prop"></div>');
			observable = ko.observable("text");
			model = {prop: observable};

			ko.applyBindings(model, fixture[0]);
		});

		it("should show the display by default", function() {
			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should show the form when clicked", function() {
			$(".et-display", fixture).trigger("click");
			expect($(".et-display", fixture).css("display")).toEqual("none");
			expect($(".et-form",    fixture).css("display")).not.toEqual("none");
		});

		it("should update the value using the button", function() {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");
			$("button", fixture).trigger("click");

			expect(model.prop).toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should update the value using the ENTER key", function() {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");
			e = jQuery.Event("keypress");
			e.keyCode = 13 //ENTER key
			$("input", fixture).trigger(e);

			expect(model.prop).toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});

		it("should update the label when the value changes", function() {
			model.prop("changed value");

			expect($(".et-label", fixture).text()).toEqual("changed value");
			expect($("input",     fixture).val() ).toEqual("changed value");
		});

		it("should stop editing using the ESC key", function() {
			spyOn(model, "prop");

			$(".et-display", fixture).trigger("click");
			$("input", fixture).val("entered value");
			e = jQuery.Event("keypress");
			e.keyCode = 27 //ESC key
			$("input", fixture).trigger(e);

			expect(model.prop).not.toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});
	});
});

