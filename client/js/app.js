(function(EP) {
	"use strict";
	if(location.hash === "") {
		location.hash = EP.Tools.base64Id(8);
	}
	var poker = new EP.PokerView(location.hash);
	ko.applyBindings(poker);

})(window.EP = window.EP || {});
