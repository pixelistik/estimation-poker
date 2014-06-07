(function(ko) {
	"use strict";

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
						observable(+$(this).text());
					}
				});
			});
		},
		update: function(element, valueAccessor) {
			var observable = valueAccessor();
			$("button", element).each(function() {
				$(this).removeClass("active");

				if(+$(this).text() === observable()) {
					$(this).addClass("active");
				}
			});
		}
	};

	ko.bindingHandlers.editableText = {
		init: function(element, valueAccessor) {

			$(element).addClass("editableText");

			$('<span class="et-display"><span class="et-label"></span><span class="et-hint"></span></span><span class="et-form"><input/><button type="submit" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-ok"></span></button></span>').appendTo(element);

			$(".et-form", element).hide();

			var startEditing = function() {
				$(element).addClass("editing");
				$(".et-display", element).hide();
				$(".et-form", element).show();
				$(".et-form input", element).focus();
			};

			var save = function() {
				$(element).removeClass("editing");
				$(".et-display", element).show();
				$(".et-form", element).hide();

				var observable = valueAccessor();
				observable($("input", element).val());
			};

			var abort = function() {
				$(element).removeClass("editing");
				$(".et-display", element).show();
				$(".et-form", element).hide();
			};

			$(".et-display", element).on("click", startEditing);
			$("button", element).on("click", save);
			$("input", element).on("keypress", function(e) {if(e.keyCode === 13) {save();}});
			$("input", element).on("keypress", function(e) {if(e.keyCode === 27) {abort();}});
		},
		update: function(element, valueAccessor) {
			var observable = valueAccessor();
			$(".et-label", element).text(observable());
			$("input", element).val(observable());

			if(observable()) {
				$(".et-hint", element).hide();
			} else {
				//if(element.data("edit-hint") {}
				$(".et-hint", element).text($(element).data("edit-hint") || "edit");
				$(".et-hint", element).show();
			}
		}
	};
})(ko);

