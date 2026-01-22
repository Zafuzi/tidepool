![Screenshot of Tidepool](readme_screenshot.png)

<div style="display: flex; gap: 24px; align-items: center; justify-content: space-between; border-bottom: 2px solid #dd0033; padding: 26px 0; margin: 26px 0;">
    <p style="font-size: 42px; font-weight: bold;">Tidepool</p>
    <a href="https://zafuzi.itch.io/tidepool" style="background-color:#dd0033; color: white; border: 2px solid #dd0033; padding: 16px 26px; opacity: 0.9; text-decoration: none;">
        View on itch.io
    </a>
</div>

Tidepool is a game engine built with Pixi and Typescript

### Usage

- use the template button above to clone this repo into your own repo or clone the repo locally
- install dependencies: `npm install`
- run development server: `npm run dev`
- build for production: `npm run build`

### Structure

- `src/engine/`
    - Core engine files
- `src/game/`
    - `game.ts` - Main game initialization code
    - `components/` - Individual game components like player, enemy, etc.
- `index.html`
    - Entry point that loads the game via Vite
    - Also where I like to write my HUD and menus

### Distribute

Tidepool is set up to publish to itch using butler.

- first go to itch and upload a new project
- name your project and get the projects id from the Project URL field
    - for example `https://zafuzi.itch.io/tidepool`, in this case we just want `tidepool`
    - set the kind of project to `HTML`
    - make sure to click `save and view page` at the bottom to make your project visible to butler
        - you can set the project to `draft` to keep others from viewing your project.
- Edit `deploy.sh` and change username to your itch username and game_name to your games unique id from above
- run `npm run deploy` which will build the project and upload to butler
    - or manually: `npm run build` then `./deploy.sh -p`
    - optionally use `./deploy.sh -c -p` the `-c` will clean your local `dist` folder before generating the new package
