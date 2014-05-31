(function(ko) {
	"use strict";
	ko.bindingHandlers.jqSlider = {
		// Initialize the binding. This is called once
		init: function(element, valueAccessor) {
			$(element).slider({
				min: 0,
				max: 100,
				// Set up the jQueryUI event handler
				change: function(event, ui) {
					console.log("jQuery UI change() called");
					// get the accessor function from KO
					var observable = valueAccessor();
					// pass the new value into the View Model, using the accessor
					observable(ui.value);
				}
			});
		},
		// This is called whenever the value in the View Model updates.
		update: function(element, valueAccessor) {
			console.log("KO update() called");
			// get the accessor function from KO
			var observable = valueAccessor();
			// Set the value of the jQuery UI Slider, read from View Model
			$(element).slider( "option", "value", observable());
		}
	};

	ko.bindingHandlers.moneyText = {
		update: function(element, valueAccessor, allBindingsAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());

			var precision =         ko.utils.unwrapObservable(allBindingsAccessor().precision) ||         ko.bindingHandlers.moneyText.defaultPrecision;
			var decimalSeparator =  ko.utils.unwrapObservable(allBindingsAccessor().decimalSeparator) ||  ko.bindingHandlers.moneyText.defaultDecimalSeparator;
			var thousandSeparator = ko.utils.unwrapObservable(allBindingsAccessor().thousandSeparator) || ko.bindingHandlers.moneyText.defaultThousandSeparator;
			var currencySymbol =    ko.utils.unwrapObservable(allBindingsAccessor().currencySymbol) ||    ko.bindingHandlers.moneyText.defaultCurrencySymbol;

			var formattedValue = value.toFixed(precision);
			formattedValue = formattedValue.replace(".", ko.bindingHandlers.moneyText.defaultDecimalSeparator);
			formattedValue = formattedValue + ko.bindingHandlers.moneyText.defaultCurrencySymbol;

			ko.bindingHandlers.text.update(element, function() { return formattedValue; });
		},
		defaultPrecision: 2,
		defaultDecimalSeparator: ",",
		defaultThousandSeparator: ",",
		defaultCurrencySymbol: "€"
	};

	ko.bindingHandlers.estimationSelect = {
		init: function(element, valueAccessor) {
			var values = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

			$(element).addClass("estimationSelect");

			for(var i = 0; i < values.length; i++) {
				$('<button type="button" class="btn">' + values[i] + '</button>').appendTo(element);
			}

			$("button", element).each(function() {
				$(this).click(function() {
					var observable = valueAccessor();
					// Unset value if the button was already active
					if($(this).hasClass("active")) {
						observable(false);
					} else {
						observable($(this).text());
					}
				});
			});
		},
		update: function(element, valueAccessor) {
			var observable = valueAccessor();
			$("button", element).each(function() {
				$(this).removeClass("active");
				if(observable() && $(this).text() == observable()) {
					$(this).addClass("active");
				}
			});
		}
	};
})(ko);



