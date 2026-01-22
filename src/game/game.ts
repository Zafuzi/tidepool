import { OldFilmFilter } from "pixi-filters";
import { type Viewport } from "pixi-viewport";
import { Assets, Point } from "pixi.js";
import Background from "./components/background.ts";
import { Player } from "./components/player.ts";
import { Sound } from "@pixi/sound";
import { EntityText } from "../engine/Entity.ts";
import { App } from "../engine/Application.ts";

export default async function Game(viewport: Viewport) {
	// -------------------- SETUP --------------------
	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential");

	// configure the viewport
	viewport.setSize(window.innerWidth, window.innerHeight);
	viewport.setZoom(0.8);

	// add a background image
	const background = new Background({ fileName: "bg", tileHeight: 42, tileWidth: 42 });

	// -------------------- END SETUP --------------------

	// -------------------- STARTUP --------------------
	// turn off scrolling
	viewport.pause = true;

	// Set filters
	const oldFilm = new OldFilmFilter({
		scratch: 0,
		sepia: 0,
		noise: 0,
		vignetting: 0.3,
		vignettingBlur: 0.5,
	});

	viewport.filters = [oldFilm];
	background.onViewportMoved(viewport);

	viewport.on("moved", () => {
		background.onViewportMoved(viewport);
	});

	// add a start screen
	const start = new EntityText({
		position: new Point(App.screen.width / 2, App.screen.height / 2),
		text: "Click to Start",
		style: {
			fontSize: 48,
			fontFamily: "Helvetica, Roboto, Arial",
			fill: "white",
			wordWrapWidth: 300,
		},
	});
	viewport.addChild(start);

	// this is here to wait until user interaction to play sounds
	window.addEventListener(
		"click",
		() => {
			const player = new Player();
			viewport.follow(player); // follow the player

			const ambient_sound = Sound.from(Assets.get("underwater"));
			ambient_sound.loop = true;
			ambient_sound.play();
			ambient_sound.volume = 0.3;

			// clear start screen
			start.destroy();
			viewport.removeChild(start);

			// Add the game objects to the world container...
			viewport.addChild(player, background);

			// turn scrolling back on
			viewport.pause = false;
		},
		{ once: true },
	);
	// -------------------- END STARTUP --------------------
}
