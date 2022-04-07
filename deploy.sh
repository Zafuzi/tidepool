#!/bin/bash

username=zafuzi
gameName=tidepool

if [[ " $@ " =~ "-c " ]]; then
	echo "removing old 'dist' ..."
	rm -rf dist
fi

echo "creating 'dist' ..."
mkdir -p dist

cp index.html dist
cp *.js dist
cp -rL data dist
cp -rL components dist


if [[ " $@ " =~ "-z " ]]; then
  echo "creating dist.zip"
	rm dist.zip
	zip -r dist.zip dist;
fi

if [[ " $@ " =~ "-p " ]]; then
	# edit this line to push to itch
	butler push dist $username/$gameName:html5;
fi

if [[ " $@ " =~ "-s " ]]; then
	butler status $username/$gameName:html5
fi