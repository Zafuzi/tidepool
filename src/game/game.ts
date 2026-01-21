import { Container, DEG_TO_RAD, Point, Ticker, type AssetsBundle } from "pixi.js";
import { SquidGraphic, SquidText } from "../core/Squids.ts";
import { Slime } from "./components/slime";
import { NumberInRange } from "../core/Math.ts";
import type { Viewport } from "pixi-viewport";

export default function Game({ viewport, hud, worldWidth, worldHeight, assets }: {
	viewport: Viewport;
	hud: Container;
	worldWidth: number;
	worldHeight: number;
	assets: AssetsBundle;
}) {
	// Call any component you want...
	const player = new Slime();

	// Or just use the API directly...
	const velocity = new SquidText({
		text: "Velocity: 0",
		position: new Point(20, 20),
	});
	velocity.element.anchor.set(0, 0);
	velocity.element.style.wordWrapWidth = 300;

	// Customize the text element...
	velocity.element.style.align = "left";

	// Tutorial text
	const tutorial = new SquidText({
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

	// genrate some random shapes
	for (let i = 0; i < 1_000; i++) {
		const shape = new SquidGraphic({
			position: new Point(NumberInRange(-worldWidth * 10, worldHeight * 10), NumberInRange(-worldHeight * 10, worldHeight * 10)),
		});
		shape.graphics.circle(0, 0, 10);
		// random color
		shape.graphics.fill(NumberInRange(0x000000, 0xffffff));
		// random alpha
		shape.graphics.alpha = NumberInRange(0.1, 1);
		// random scale
		shape.graphics.scale.set(NumberInRange(0.1, 2), NumberInRange(0.1, 2));
		// random rotation
		shape.rotation = NumberInRange(0, 360);
		viewport.addChild(shape);
		shape.update = (time: Ticker) => {
			shape.rotation += DEG_TO_RAD * NumberInRange(0.01, 0.8) * time.deltaTime;
		};
	}

	// Add the game objects to the world container...
	viewport.addChild(player);
	hud.addChild(velocity, tutorial);

	// update the camera
	viewport.follow(player);
}