(function (ko) {
	"use strict";

	ko.bindingHandlers.estimationSelect = {
		init: function (element, valueAccessor) {
			var values = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

			element.classList.add("estimation-select");

			for(var i = 0; i < values.length; i++) {
				var markup = '<button type="button" class="btn  estimation-select__btn  estimation-select__btn-' + values[i] + '">' + values[i] + '</button>';
				element.insertAdjacentHTML('beforeend', markup);
			}


			var buttons = element.querySelectorAll("button");

			var clickHandler = function () {
				var observable = valueAccessor();
				// Unset value if the button was already active
				if(this.classList.contains("active")) {
					observable(false);
				} else {
					observable(+this.textContent);
				}
			};

			for (i = 0; i < buttons.length; i++) {
				buttons[i].addEventListener("click", clickHandler);
			}

			/*
			 * Activate the next (+1) or previous (-1) value
			 *
			 * When no value is selected, select the first (+1) or last (-1) one.
			 */
			var shiftValue = function (indexDelta) {
				var observable = valueAccessor();

				var currentValueIndex, nextValueIndex;

				currentValueIndex = values.indexOf(observable());

				if (currentValueIndex !== -1) {
					nextValueIndex = currentValueIndex + indexDelta;
				} else {
					if (indexDelta === +1) {
						nextValueIndex = 0;
					}

					if (indexDelta === -1) {
						nextValueIndex = values.length -1;
					}
				}

				var nextValue = values[nextValueIndex];

				if (typeof nextValue !== "undefined") {
					observable(nextValue);
				}
			};

			document.addEventListener("keypress", function (e) {
				// These bindings shall only work outside of inputs
				if (e.target.tagName && e.target.tagName.toLowerCase() === "input") {
					return;
				}

				if (e.key === "+") {
					shiftValue(+1);
				}

				if (e.key === "-") {
					shiftValue(-1);
				}
			});
		},
		update: function (element, valueAccessor) {
			var observable = valueAccessor();

			var buttons = element.querySelectorAll("button");

			for (var i = 0; i < buttons.length; i++) {
				if(+buttons[i].textContent === observable()) {
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
			element.insertAdjacentHTML('beforeend', markup);

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
})(ko);

