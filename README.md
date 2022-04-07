_______________________________________________________________________________

  
                                 TIDEPOOL

                  A starter game template using Squids.js 

_______________________________________________________________________________

![Screenshot of Tidepool](readme_screenshot.png)
[Tidepool on itch.io](https://zafuzi.itch.io/tidepool)

## about
Tidepool is a simplified template that contains everything you need to make a game using Squids.js

## structure
 - squids.full.min.js
   - npm distributable of the squids game engine
 - index.html
   - loads game.js
 - game.js
   - game code
 - components/*.js
   - individual nodes for the game like player, enemy, etc...

## how to use
 - use the template button above to clone this repo into your own repo
 - clone the repo locally
 - run npm install
 - I recommend using a PHP server or a Node server to serve the files locally. I use php -S localhost:3000
 - visit [squids.sleepless.com](https://squids.sleepless.com) for more information on how to use the squids engine

## distribution
Tidepool is setup to publish to itch using butler.

- first go to itch and upload a new project
- name your project and get the projects id from the Project URL field
  - for example `https://zafuzi.itch.io/tidepool`, in this case we just want `tidepool`
  - set the kind of project to `HTML`
  - make sure to click `save and view page` at the bottom to make your project visible to butler
    - you can set the project to `draft` to keep others from viewing your project.

## UNIX ONLY AUTOMATION
- Edit `deploy.sh` and change username to your itch username and gameName to your games unique id from above
- run `./deploy.sh -p` the -p flag will attempt to upload to butler
  - optionally use `./deploy.sh -c -p` the `-c` will clean your local `dist` folder before generating the new package
