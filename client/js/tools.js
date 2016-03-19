(function(window) {
	"use strict";

	var Tools = {};

	Tools.uuid = function () {
		return('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}));
	};

	Tools.base64Id = function (length) {
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var id = "";

		var rnd;

		for (var i = 0; i < length; i++) {
			rnd = Math.random() * chars.length | 0;
			id += chars[rnd];
		}

		return id;
	};

	// Cookie functions: http://www.quirksmode.org/js/cookies.html
	Tools.createCookie = function (name, value, days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		}

		document.cookie = name + "=" + value + expires + "; path=/";
	};

	Tools.readCookie = function (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1, c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length, c.length);
			}
		}
		return null;
	};

	Tools.eraseCookie = function (name) {
		Tools.createCookie(name, "", -1);
	};

	Tools.safeMailtoHref = function (subject, body) {
		return "mailto:?" +
			"subject=" +
			encodeURIComponent(subject) +
			"&" +
			"body=" +
			encodeURIComponent(body);
	};

	Tools.bootstrapDropdowns = function () {
		var dropdownTriggers = document.querySelectorAll(".dropdown-toggle");
		var dropdownMenu = document.querySelectorAll(".dropdown-menu");

		var toggleParentOpen = function(el){
			el.addEventListener("click", function () {
				this.parentNode.classList.toggle("open");
			});
		};

		Array.prototype.forEach.call(dropdownMenu, toggleParentOpen);
		Array.prototype.forEach.call(dropdownTriggers, toggleParentOpen);
	};

	Tools.init = function () {
		Tools.bootstrapDropdowns();
	};

	// Export as module or global
	if (typeof module !== "undefined" && module.exports) {
		module.exports = Tools;
	} else {
		window.EP = window.EP || {};
		window.EP.Tools = Tools;
	}

})(this);
