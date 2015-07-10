var page = require('webpage').create();
page.viewportSize = {
	width: 960,
	height: 2000
};
page.open('SpecRunner.html', function() {
	setTimeout(function() {
		var errors = page.evaluate(function() {
			return document.querySelectorAll('.failures .spec-detail');
		});

		var errorCount = errors.length;

		if(errorCount > 0) {
			console.log("There were " + errorCount + " failures.");
			page.render("jasmine-errors.png");
			phantom.exit(1);
		}

		phantom.exit();
	}, 2000)

});
