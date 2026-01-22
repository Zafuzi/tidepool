---
TIDEPOOL

A starter game template using Squids.js
---

![Screenshot of Tidepool](readme_screenshot.png)
[Tidepool on itch.io](https://zafuzi.itch.io/tidepool)

## about

Tidepool is a simple game engine built with Pixi and Typescript mainly for deploying to [Itch.io](thttps://itch.io)

## structure

- `src/engine/`
    - Core engine files
- `src/game/`
    - `game.ts` - Main game initialization code
    - `components/` - Individual game components like player, enemy, etc.
- `index.html`
    - Entry point that loads the game via Vite
    - Also where I like to write my HUD and menus

## how to use

- use the template button above to clone this repo into your own repo or clone the repo locally
- install dependencies: `npm install`
- run development server: `npm run dev`
- build for production: `npm run build`

## distribution

Tidepool is set up to publish to itch using butler.

- first go to itch and upload a new project
- name your project and get the projects id from the Project URL field
    - for example `https://zafuzi.itch.io/tidepool`, in this case we just want `tidepool`
    - set the kind of project to `HTML`
    - make sure to click `save and view page` at the bottom to make your project visible to butler
        - you can set the project to `draft` to keep others from viewing your project.

## deployment

- Edit `deploy.sh` and change username to your itch username and game_name to your games unique id from above
- run `npm run deploy` which will build the project and upload to butler
    - or manually: `npm run build` then `./deploy.sh -p`
    - optionally use `./deploy.sh -c -p` the `-c` will clean your local `dist` folder before generating the new package
