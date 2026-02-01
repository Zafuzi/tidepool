import { OldFilmFilter } from "pixi-filters";
import { type Viewport } from "pixi-viewport";
import { Assets, DEG_TO_RAD, Point } from "pixi.js";
import Background from "./components/background.ts";
import { Player } from "./components/player.ts";
import { Sound } from "@pixi/sound";
import { EntityText, App, EntitySprite, Entity, Direction, Cartesian, Magnitude, Azimuth, Distance, NumberInRange, LocationAround, CoinFlip } from "../engine/Engine.ts";
import { collideEntities } from "../engine/Collision.ts";

export default async function Game(viewport: Viewport) {
	// -------------------- STARTUP --------------------
	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential");

	// configure the viewport
	viewport.setSize(window.innerWidth, window.innerHeight);
	viewport.setZoom(0.8);

	// add a background image
	const background = new Background({ fileName: "bg", tileHeight: 42, tileWidth: 42 });

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

			const thing = new EntitySprite({
				fileName: "thing",
				position: LocationAround(player.position, 300, 1000),
				scale: new Point(2, 2),
				rotation_velocity: 1 / 2,
			});

			thing.sprite.anchor.set(0.5);

			const bubble_sound = Sound.from(Assets.get("bubble"));
			thing.update = function (ticker) {
				if (collideEntities({
					body: new Point(thing.width, thing.height),
					position: thing.position,
					scale: thing.scale,
				}, {
					body: new Point(player.width, player.height),
					position: player.position,
					scale: player.scale,
				})) {
					thing.position = LocationAround(player.position, 300, 1000);
					bubble_sound.play();
					thing.rotation = NumberInRange(0, 360) * DEG_TO_RAD;
					if (CoinFlip()) {
						thing.rotation_velocity *= -1
					}
				}

				if (App.tick % 500 === 0) {
					if (CoinFlip()) {
						thing.rotation_velocity *= -1
					}
					thing.acceleration = Cartesian(thing.rotation).multiplyScalar(2)
				}

				thing.velocity = Cartesian(thing.rotation)
				thing.acceleration = thing.acceleration.multiplyScalar(0.99)
				thing.newtonian(ticker)
			}

			viewport.follow(player); // follow the player
			viewport.setZoom(0.1);

			const ambient_sound = Sound.from(Assets.get("underwater"));
			ambient_sound.loop = true;
			ambient_sound.volume = 0.3;
			ambient_sound.play();

			// clear start screen
			start.destroy();
			viewport.removeChild(start);

			// Add the game objects to the world container...
			viewport.addChild(background, player, thing);

			// turn scrolling back on
			viewport.pause = false;
		},
		{ once: true },
	);
	// -------------------- END STARTUP --------------------
}
