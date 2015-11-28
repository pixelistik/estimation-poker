(function (ko) {
	"use strict";

	ko.bindingHandlers.pageTitle = {
		update: function (element, valueAccessor) {
			var observable = valueAccessor();
			document.title = observable();
		}
	};
})(window.ko);
