"use strict";

var xssFilters = require('xss-filters');

var estimationSelectFactory = function (ko,document) {

	ko.bindingHandlers.estimationSelect = {
		init: function (element, valueAccessor) {
			var value = valueAccessor().value;
			var values = valueAccessor().valueSet;

			element.classList.add("estimation-select");

			var clickHandler = function (event) {
				// Unset value if the button was already active
				if(event.target.classList.contains("active")) {
					value(false);
				} else {
					value(+event.target.getAttribute("data-index"));
				}
			};

			element.addEventListener("click", clickHandler);

			/*
			 * Activate the next (+1) or previous (-1) value
			 *
			 * When no value is selected, select the first (+1) or last (-1) one.
			 */
			var shiftValue = function (delta) {
				var newValue;

				if (value() === false) {
					if (delta === +1) {
						newValue = 0;
					}

					if (delta === -1) {
						newValue = values().length - 1;
					}
				} else {
					newValue = value() + delta;
				}

				if (
					newValue >= 0 &&
					newValue <= values().length - 1
				) {
					value(newValue);
				}
			};

			document.addEventListener("keypress", function (e) {
				// These bindings shall only work outside of inputs
				if (e.target.tagName && e.target.tagName.toLowerCase() === "input") {
					return;
				}

				if (e.key === "+" || e.keyCode === 43) {
					shiftValue(+1);
				}

				if (e.key === "-" || e.keyCode === 45) {
					shiftValue(-1);
				}
			});
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor().value;
			var values = valueAccessor().valueSet();

			var markup = "";
			for(var i = 0; i < values.length; i++) {
				markup += '<button type="button" class="btn  estimation-select__btn  estimation-select__btn-' + i + '" data-index="' + i + '">' + xssFilters.inHTMLData(values[i]) + '</button>';
			}

			element.innerHTML = "";
			element.insertAdjacentHTML('beforeend', markup);

			var buttons = element.querySelectorAll("button");

			for (i = 0; i < buttons.length; i++) {
				if(+buttons[i].getAttribute("data-index") === value()) {
					buttons[i].classList.add("active");
				} else {
					buttons[i].classList.remove("active");
				}
			}
		}
	};
};

module.exports = estimationSelectFactory;
