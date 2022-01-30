#!/bin/bash

if [[ " $@ " =~ "-c " ]]; then
	echo "removing old 'dist' ..."
	rm -rf dist
	rm dist.zip
fi


echo "creating 'dist' ..."
mkdir -p dist

cp index.html dist
cp *.js dist
cp -rL data dist
cp -rL lib dist
cp -rL nodes dist

echo "minifying dist/game.js"
node_modules/uglify-js/bin/uglifyjs dist/game.js --compress --mangle --output dist/game.js;

files=(dist/**/*.js)

for file in ${files[*]}
do
	echo "minifying $file"
	cat $file | node_modules/uglify-js/bin/uglifyjs --compress --mangle --output $file;
done

if [[ " $@ " =~ "-z " ]]; then
	zip -r dist.zip dist;
fi

if [[ " $@ " =~ "-p " ]]; then
	# edit this line to push to itch
	butler push dist username/game_name:html5;
fi

if [[ " $@ " =~ "-s " ]]; then
	butler status username/game_name:html5
fi
