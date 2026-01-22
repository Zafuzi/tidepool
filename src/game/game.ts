import { OldFilmFilter } from "pixi-filters";
import { type Viewport } from "pixi-viewport";
import { Assets } from "pixi.js";
import Background from "./components/background.ts";
import { Player } from "./components/player.ts";
import { Sound } from "@pixi/sound";

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
	window.addEventListener(
		"click",
		() => {
			const player = new Player();
			viewport.follow(player); // follow the player

			const ambient_sound = Sound.from(Assets.get("underwater"));
			ambient_sound.loop = true;
			ambient_sound.play();
			ambient_sound.volume = 0.3;
			// Add the game objects to the world container...
			viewport.addChild(player, background);
		},
		{ once: true },
	);

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
	// -------------------- END STARTUP --------------------
}
