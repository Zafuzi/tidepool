import type { Viewport } from "pixi-viewport";
import { Assets, Container, Point } from "pixi.js";
import { App, EntityText } from "../engine/Engine.ts";
import Background from "./components/background.ts";
import { Player } from "./components/player.ts";

export default async function Game({
	viewport,
	hud,
	worldWidth,
	worldHeight,
}: {
	viewport: Viewport;
	hud: Container;
	worldWidth: number;
	worldHeight: number;
}) {
	// -------------------- SETUP --------------------
	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential");

	// configure the viewport
	viewport.setSize(window.innerWidth, window.innerHeight);
	viewport.setZoom(0.8);

	// add a background image
	const background = new Background({ fileName: "bg", tileHeight: 42, tileWidth: 42 });

	const player = new Player();
	viewport.follow(player); // follow the player

	const velocity = new EntityText({
		text: "<strong>Velocity:</strong> 0",
		position: new Point(20, App.screen.height - 20),
		style: {
			wordWrapWidth: 300,
			align: "left",
			padding: 20,
			fill: "white",
			fontFamily: "Monospace",
		},
	});
	velocity.element.anchor.set(0, 1); // put text in bottom left
	velocity.update = () => {
		if (player && velocity?.element) {
			velocity.element.text = `<strong>Velocity:</strong> <em>${player.velocity.x.toPrecision(2)}, ${player.velocity.y.toPrecision(2)}</em>`;
		}
	};

	// Tutorial text
	const tutorial = new EntityText({
		position: new Point(worldWidth / 2, worldHeight - 50),
		text: "Use Arrow Keys, WASD, or Gamepad Left Stick to move the player",
		style: {
			align: "center",
			fontSize: 16,
			fontFamily: "Arial",
			fill: "#ffffff",
			wordWrap: true,
			wordWrapWidth: 300,
		},
	});
	tutorial.element.anchor.set(0.5, 1);

	// Remove tutorial text after 5 seconds
	setTimeout(() => {
		tutorial.element.text = "";
	}, 5_000);

	viewport.on("moved", () => {
		background.onViewportMoved(viewport, worldWidth, worldHeight);
	});

	// -------------------- END SETUP --------------------

	// -------------------- STARTUP --------------------
	// Add the game objects to the world container...
	viewport.addChild(player, background);

	// add the HUD elements to the HUD container
	hud.addChild(velocity, tutorial);
	// -------------------- END STARTUP --------------------
}
