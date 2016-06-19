"use strict";

var pageTitleFactory = function (ko, document) {
	ko.bindingHandlers.pageTitle = {
		update: function (element, valueAccessor) {
			var observable = valueAccessor();
			document.title = observable();
		}
	};
};

module.exports = pageTitleFactory;
