import type { Viewport } from "pixi-viewport";
import { type AssetsBundle, Container, Point } from "pixi.js";
import { EntityText } from "../engine/Entity";
import { App } from "../engine/index.ts";
import { spawn } from "../engine/Spawner.ts";
import { Slime } from "./components/slime";

export default function Game({
	viewport,
	hud,
	worldWidth,
	worldHeight,
	assets,
}: {
	viewport: Viewport;
	hud: Container;
	worldWidth: number;
	worldHeight: number;
	assets: AssetsBundle;
}) {
	// Call any component you want...
	const player = new Slime();

	// Or just use the API directly...
	const velocity = new EntityText({
		text: "Velocity: 0",
		position: new Point(20, App.screen.height - 20),
	});
	velocity.element.anchor.set(0, 1);
	velocity.element.style.wordWrapWidth = 300;

	// Customize the text element...
	velocity.element.style.align = "left";

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

	// Customize the update function...
	velocity.update = () => {
		if (player && velocity?.element) {
			velocity.element.text = `<strong>Velocity: ${player.velocity.x.toPrecision(2)}, ${player.velocity.y.toPrecision(2)}</strong>`;
		}
	};

	spawn(viewport, worldHeight, worldWidth);

	// Add the game objects to the world container...
	viewport.addChild(player);

	// add the HUD elements to the HUD container
	hud.addChild(velocity, tutorial);

	// update the camera
	viewport.follow(player);
}
