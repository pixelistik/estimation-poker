(function(EP) {
	"use strict";
	if(location.hash === "") {
		location.hash = EP.Tools.uuid();
	}
	var poker = new EP.PokerView(location.hash);
	ko.applyBindings(poker);

})(window.EP = window.EP || {});
