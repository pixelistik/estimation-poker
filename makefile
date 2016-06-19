.PHONY: all release lint committedworkingdir

all:

release: lint committedworkingdir
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
	git diff-index --quiet HEAD

lint:
	node_modules/jshint/bin/jshint .
	node_modules/csslint/cli.js client/css/style.css
