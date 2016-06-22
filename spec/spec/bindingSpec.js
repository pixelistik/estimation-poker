var ko = require("knockout");
var $ = require("jquery");

require("../../client/js/bindings/editableText.js")(ko);
require("../../client/js/bindings/estimationSelect.js")(ko, document);
require("../../client/js/bindings/pageTitle.js")(ko, document);

var crossBrowser_initKeyboardEvent = require("../helpers/crossBrowserInitKeyboardEvent.js");

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

			e = crossBrowser_initKeyboardEvent("keypress", {key: "Enter", keyCode: 13});
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

			e = crossBrowser_initKeyboardEvent("keypress", {key: "Esc", keyCode: 27});
			fixture[0].querySelector("input").dispatchEvent(e);

			expect(model.prop).not.toHaveBeenCalledWith("entered value");

			expect($(".et-display", fixture).css("display")).not.toEqual("none");
			expect($(".et-form",    fixture).css("display")).toEqual("none");
		});
	});

	describe("estimationSelect", function () {
		var fixture, model, observable;

		beforeEach(function () {
			fixture = $('<div data-bind="estimationSelect: {value: prop, valueSet: valueSet}"></div>');

			observable = ko.observable(false);
			observableSet = ko.observableArray(
				[0, 1, 2, 3, 5, 8, 13, 20, 40, 100]
			);

			model = {
				prop: observable,
				valueSet: observableSet
			};

			ko.applyBindings(model, fixture[0]);
		});

		describe("DOM elements", function () {
			it("should initialise with the Scrum values by default", function () {
				var buttons = fixture.find(".estimation-select__btn");

				expect(buttons.length).toEqual(10);

				expect(buttons[0].textContent).toEqual("0");
				expect(buttons[1].textContent).toEqual("1");
				expect(buttons[2].textContent).toEqual("2");
				expect(buttons[3].textContent).toEqual("3");
				expect(buttons[4].textContent).toEqual("5");
				expect(buttons[5].textContent).toEqual("8");
				expect(buttons[6].textContent).toEqual("13");
				expect(buttons[7].textContent).toEqual("20");
				expect(buttons[8].textContent).toEqual("40");
				expect(buttons[9].textContent).toEqual("100");
			});

			it("should not assign the active class when no value is set", function () {
				model.prop(false);

				expect(fixture.find(".active").length).toEqual(0);
			});

			it("should assign the 'active' class to the button matching the current value", function () {
				var activeButton

				model.prop(0);
				activeButton = fixture.find(".active")[0];
				expect(activeButton.textContent).toEqual("0");

				model.prop(9);
				activeButton = fixture.find(".active")[0];
				expect(activeButton.textContent).toEqual("100");
			});
		});

		describe("custom estimation values", function () {
			it("should use the values passed on init", function () {
				fixture = $('<div data-bind="estimationSelect: {value: prop, valueSet: valueSet}"></div>');

				observable = ko.observable(1);
				observableSet = ko.observableArray(["M", "L"]);
				model = {
					prop: observable,
					valueSet: observableSet
				};

				ko.applyBindings(model, fixture[0]);

				var buttons = fixture.find(".estimation-select__btn");

				expect(buttons.length).toEqual(2);

				expect(buttons[0].textContent).toEqual("M");
				expect(buttons[1].textContent).toEqual("L");
			});

			it("should change the DOM elements when the values are changed", function () {
				var buttons = fixture.find(".estimation-select__btn");

				expect(buttons.length).toEqual(10);

				model.valueSet(["one", "two"]);

				buttons = fixture.find(".estimation-select__btn");

				expect(buttons.length).toEqual(2);
				expect(buttons[0].textContent).toEqual("one");
				expect(buttons[1].textContent).toEqual("two");
			});

			it("should be safe against XSS", function () {
				model.valueSet(["<span>one</span>", "two"]);

				var injectedSpan = fixture.find(".estimation-select__btn span");

				expect(injectedSpan.length).toEqual(0);
			})
		});

		describe("mouse click binding", function () {
			it("should set the value of the clicked button", function () {
				$(".estimation-select__btn-1", fixture).click();
				expect(model.prop()).toEqual(1);

				$(".estimation-select__btn-5", fixture).click();
				expect(model.prop()).toEqual(5);
			});

			it("should unset the value when the active button is clicked again", function () {
				$(".estimation-select__btn-1", fixture).click();
				$(".estimation-select__btn-1", fixture).click();
				expect(model.prop()).toEqual(false);
			});
		});

		describe("+/- key binding", function () {
			it("should go from undefined to the lowest value with +", function () {
				e = crossBrowser_initKeyboardEvent("keypress", {"key": "+"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(0);
			});

			it("should go from undefined to the highest value with -", function () {
				e = crossBrowser_initKeyboardEvent("keypress", {"key": "-"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(9);
			});

			it("should go to the highest value with - correctly after a changed value set", function () {
				model.valueSet(["some", "other", "set"])

				e = crossBrowser_initKeyboardEvent("keypress", {"key": "-"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(2);
			});

			it("should increase one step with +", function () {
				model.prop(3);

				e = crossBrowser_initKeyboardEvent("keypress", {"key": "+"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(4);
			});

			it("should decrease one step with -", function () {
				model.prop(5);

				e = crossBrowser_initKeyboardEvent("keypress", {"key": "-"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(4);
			});

			it("should not go above the max with +", function () {
				model.prop(9);

				e = crossBrowser_initKeyboardEvent("keypress", {"key": "+"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(9);
			});

			it("should not go below the min with -", function () {
				model.prop(0);

				e = crossBrowser_initKeyboardEvent("keypress", {"key": "-"})
				document.dispatchEvent(e);

				expect(model.prop()).toEqual(0);
			});
		});
	});
});
