(function(EP, ko, QRCode) {
	"use strict";
	if(location.hash === "") {
		location.hash = EP.Tools.base64Id(8);
	}
	var poker = new EP.PokerView(location.hash);
	ko.components.register('card', {
		template: { element: 'card' }
	});
	ko.applyBindings(poker);

	new QRCode(document.getElementById("sharing-qr-code"), location + "");

})(window.EP = window.EP || {}, window.ko, window.QRCode);
