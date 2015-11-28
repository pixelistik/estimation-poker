(function (ko) {
	"use strict";

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

			element.innerHTML = "";
			for(var i = 0; i < values.length; i++) {
				var markup = '<button type="button" class="btn  estimation-select__btn  estimation-select__btn-' + i + '" data-index="' + i + '">' + values[i] + '</button>';
				element.insertAdjacentHTML('beforeend', markup);
			}

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

	ko.bindingHandlers.editableText = {
		init: function (element, valueAccessor) {

			element.classList.add("editable-text");

			var markup = '<span class="et-display"><span class="et-label"></span><span class="et-hint"></span></span><span class="et-form"><input/><button type="submit" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-ok"></span></button></span>';
			element.innerHTML = markup;

			element.querySelector(".et-form").style.display = 'none';

			var startEditing = function () {
				element.classList.add("editing");
				element.querySelector(".et-display").style.display = 'none';
				element.querySelector(".et-form").style.display = '';
				element.querySelector(".et-form input").focus();
			};

			var save = function () {
				element.classList.remove("editing");
				element.querySelector(".et-display").style.display = '';
				element.querySelector(".et-form").style.display = 'none';

				var observable = valueAccessor();
				observable(element.querySelector("input").value);
			};

			var abort = function () {
				element.classList.remove("editing");
				element.querySelector(".et-display").style.display = '';
				element.querySelector(".et-form").style.display = 'none';
			};

			element.querySelector(".et-display").addEventListener("click", startEditing);


			element.querySelector("button").addEventListener("click", save);

			element.querySelector("input").addEventListener("keypress", function (e) {if(e.keyCode === 13) {save();}});
			element.querySelector("input").addEventListener("keypress", function (e) {if(e.keyCode === 27) {abort();}});
			element.querySelector("input").addEventListener("blur", save);
		},
		update: function (element, valueAccessor) {
			var observable = valueAccessor();
			element.querySelector(".et-label").textContent = observable();
			element.querySelector("input").value = observable();

			if(observable()) {
				element.querySelector(".et-hint").style.display = 'none';
			} else {
				element.querySelector(".et-hint").textContent = element.getAttribute("data-edit-hint") || "edit";
				element.querySelector(".et-hint").style.display = '';
			}
		}
	};

	ko.bindingHandlers.pageTitle = {
		update: function (element, valueAccessor) {
			var observable = valueAccessor();
			document.title = observable();
		}
	};
})(window.ko);
