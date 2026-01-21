---
TIDEPOOL

A starter game template using Squids.js
---

![Screenshot of Tidepool](readme_screenshot.png)
[Tidepool on itch.io](https://zafuzi.itch.io/tidepool)

## about

Tidepool is a simplified template that contains everything you need to make a game using Squids.js

## structure

- `src/core/`
    - Core engine files: `GameApp.ts`, `Squids.ts`, `Input.ts`, `Math.ts`, `Core.ts`
    - Contains the Squids.js game engine built on PixiJS
- `src/game/`
    - `game.ts` - Main game initialization code
    - `components/` - Individual game components like player, enemy, etc.
- `index.html`
    - Entry point that loads the game via Vite
- `vite.config.mts`
    - Vite configuration for building and bundling
- `package.json`
    - Dependencies and npm scripts

## how to use

- use the template button above to clone this repo into your own repo
- clone the repo locally
- install dependencies: `npm install`
- run development server: `npm run dev`
- build for production: `npm run build`
- visit [squids.sleepless.com](https://squids.sleepless.com) for more information on how to use the squids engine

## technology

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **PixiJS** - WebGL/WebGPU rendering engine
- **@brianchirls/game-input** - Gamepad and keyboard input handling

## distribution

Tidepool is set up to publish to itch using butler.

- first go to itch and upload a new project
- name your project and get the projects id from the Project URL field
    - for example `https://zafuzi.itch.io/tidepool`, in this case we just want `tidepool`
    - set the kind of project to `HTML`
    - make sure to click `save and view page` at the bottom to make your project visible to butler
        - you can set the project to `draft` to keep others from viewing your project.

## deployment

- Edit `deploy.sh` and change username to your itch username and gameName to your games unique id from above
- run `npm run deploy` which will build the project and upload to butler
    - or manually: `npm run build` then `./deploy.sh -p`
    - optionally use `./deploy.sh -c -p` the `-c` will clean your local `dist` folder before generating the new package
