(function(EP) {
	"use strict";
	EP.Tools = {};

	EP.Tools.uuid = function () {
		return('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}));
	};
})(window.EP = window.EP || {});
(function (ko) {
	"use strict";

	ko.bindingHandlers.estimationSelect = {
		init: function (element, valueAccessor) {
			var values = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

			$(element).addClass("estimationSelect");

			for(var i = 0; i < values.length; i++) {
				$('<button type="button" class="btn">' + values[i] + '</button>').appendTo(element);
			}

			$("button", element).each(function () {
				$(this).click(function () {
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
		update: function (element, valueAccessor) {
			var observable = valueAccessor();
			$("button", element).each(function () {
				$(this).removeClass("active");

				if(+$(this).text() === observable()) {
					$(this).addClass("active");
				}
			});
		}
	};

	ko.bindingHandlers.editableText = {
		init: function (element, valueAccessor) {

			$(element).addClass("editableText");

			$('<span class="et-display"><span class="et-label"></span><span class="et-hint"></span></span><span class="et-form"><input/><button type="submit" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-ok"></span></button></span>').appendTo(element);

			$(".et-form", element).hide();

			var startEditing = function () {
				$(element).addClass("editing");
				$(".et-display", element).hide();
				$(".et-form", element).show();
				$(".et-form input", element).focus();
			};

			var save = function () {
				$(element).removeClass("editing");
				$(".et-display", element).show();
				$(".et-form", element).hide();

				var observable = valueAccessor();
				observable($("input", element).val());
			};

			var abort = function () {
				$(element).removeClass("editing");
				$(".et-display", element).show();
				$(".et-form", element).hide();
			};

			$(".et-display", element).on("click", startEditing);
			$("button", element).on("click", save);
			$("input", element).on("keypress", function (e) {if(e.keyCode === 13) {save();}});
			$("input", element).on("keypress", function (e) {if(e.keyCode === 27) {abort();}});
		},
		update: function (element, valueAccessor) {
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

(function (EP) {
	"use strict";

	EP.User = function (socket, uuid) {
		var self = this;

		self.uuid = uuid || EP.Tools.uuid();
		self.name = ko.observable("");
		self.estimation = ko.observable(false);

		self.broadcast = function () {
			socket.emit("update", ko.toJSON(self));
		}

		self.loadFromCookie = function () {
			if(
				$.cookie("ep.user.name") &&
				$.cookie("ep.user.uuid")
			) {
				self.name($.cookie("ep.user.name"));
				self.uuid = $.cookie("ep.user.uuid");
			}
		};

		self.saveToCookie = function () {
			$.cookie("ep.user.name", self.name());
			$.cookie("ep.user.uuid", self.uuid);
		};
	};

	EP.PokerView = function (groupName) {
		var self = this;

		var getAllEstimations = function () {
			var estimations = $.map(self.users(), function (val, i) {
				if(val.estimation() !== false) {
					return val.estimation();
				}
			});
			if(self.localUser().estimation() !== false) {
				estimations.push(self.localUser().estimation());
			}
			return estimations;
		};

		var getExistingUserByUuid = function (uuid) {
			var i = getExistingUserIndexByUuid(uuid);

			if (i === false) {
				return false;
			} else {
				return self.users()[i];
			}
		}

		var getExistingUserIndexByUuid = function (uuid) {
			for(var i=0; i < self.users().length; i++) {
				if (self.users()[i].uuid === uuid) {
					return i;
				}
			}
			return false;
		}

		var socket = io.connect("/");

		socket.on("update", function (data) {
			update(data);
		});

		socket.on("who is there", function () {
			self.localUser().broadcast();
			broadcast();
		});

		socket.on("user disconnected", function (data) {
			removeUser(data);
		});

		socket.on("new round", function () {
			self.localUser().estimation(false);
		});

		self.initNewRound = function () {
			self.localUser().estimation(false);
			socket.emit("new round");
		};

		self.localUser = ko.observable(new EP.User(socket));
		self.localUser().loadFromCookie();

		self.localUser().name.subscribe(function () {
			self.localUser().broadcast();
			self.localUser().saveToCookie();
		});

		self.localUser().estimation.subscribe(function () {
			self.localUser().broadcast();
		});

		socket.emit(
			"join",
			{
				groupName: groupName,
				userUuid: self.localUser().uuid
			}
		);

		self.localUser().broadcast();

		self.users = ko.observableArray([]);

		self.storyTitle = ko.observable("");
		self.storyTitle.subscribe(function () {
			broadcast();
		});

		// http://stackoverflow.com/a/6102340/376138
		self.highestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.max.apply(null, estimations);

			if(result === -Infinity) {
				return false;
			}
			return result;
		});

		self.lowestEstimation = ko.computed(function () {
			var estimations = getAllEstimations();

			var result = Math.min.apply(null, estimations);

			if(result === Infinity) {
				return false;
			}
			return result;
		});

		self.estimationsComplete = ko.computed(function () {
			for(var i=0; i < self.users().length; i++) {
				if (self.users()[i].estimation() === false) {
					return false;
				}
			}
			if(self.localUser().estimation() === false) {
				return false;
			}
			return true;
		});

		var broadcast = function () {
			var me = {
				storyTitle: self.storyTitle()
			};
			socket.emit("update", JSON.stringify(me));
		};

		var update = function (data) {
			var received = JSON.parse(data);

			if(received.uuid !== undefined) {
				// A user object was received:
				var user = getExistingUserByUuid(received.uuid);

				if (!user) {
					 user = new EP.User(socket, received.uuid);
					 self.users.push(user);
				}

				user.name(received.name);
				user.estimation(received.estimation);
			} else {
				// A story object was received:
				self.storyTitle(received.storyTitle);
			}
		}

		var removeUser = function (uuid) {
			var userIndex = getExistingUserIndexByUuid(uuid);

			self.users.splice(userIndex, 1);
		};
	}
})(window.EP = window.EP || {});
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
