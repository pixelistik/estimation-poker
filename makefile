.PHONY: all release lint committedworkingdir

all: client/js/client.prod.min.js.gzip client/css/lib/bootstrap.min.css.gz client/css/style.css.gz

client/js/client.prod.js: node_modules/socket.io/node_modules/socket.io-client/socket.io.js client/js/lib/knockout-min.js client/js/tools.js client/js/models.js client/js/bindings.js client/js/app.js
	@cat node_modules/socket.io/node_modules/socket.io-client/socket.io.js client/js/lib/knockout-min.js client/js/tools.js client/js/models.js client/js/bindings.js client/js/app.js > client/js/client.prod.js

client/js/client.prod.min.js: client/js/client.prod.js
	@curl --silent --data "output_info=compiled_code" --data "language=ECMASCRIPT5" --data-urlencode "js_code@client/js/client.prod.js" "http://closure-compiler.appspot.com/compile" -o client/js/client.prod.min.js

client/js/client.prod.min.js.gzip: client/js/client.prod.min.js
	@gzip --keep --force client/js/client.prod.min.js

client/css/lib/bootstrap.min.css.gz: client/css/lib/bootstrap.min.css
	@gzip --keep --force client/css/lib/bootstrap.min.css

client/css/style.css.gz: client/css/style.css
	@gzip --keep --force client/css/style.css

release: lint committedworkingdir all
	# Update version number, commit rebuilt assets
	git checkout develop
	sed -i 's/"version": ".*"/"version": "$(VERSION)"/' package.json
	git commit --all -m "Build and updated version number for release $(VERSION)"

	git checkout master
	git merge develop

	git tag "$(VERSION)" --annotate --message="Release $(VERSION)"

	git checkout develop
	git merge master

committedworkingdir:
	# Check if there are uncommitted changes
	@git diff-index --quiet HEAD

clean:
	@rm client/js/client.prod.js
	@rm client/js/client.prod.min.js
	@rm client/js/client.prod.min.js.gz

lint:
	@node_modules/jshint/bin/jshint .
	@node_modules/csslint/cli.js client/css/style.css

