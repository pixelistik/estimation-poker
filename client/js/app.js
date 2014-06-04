(function(EP) {
	"use strict";
	// Instantiate our View Model
	/*var user = new EP.User("Local");
	user.estimation(30);
	// Pass the View Model to KO
	ko.applyBindings(user);
	*/
	if(location.hash === "") {
		location.hash = EP.Tools.uuid();
	}
	var poker = new EP.PokerView(location.hash);
	ko.applyBindings(poker);

})(window.EP = window.EP || {});
