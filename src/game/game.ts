import { Point } from "pixi.js";
import { Squid, SquidGraphic, SquidSprite, SquidText } from "../core/Squids.ts";
import { Slime } from "./components/slime";
import { WorldContainer, WORLD_WIDTH, WORLD_HEIGHT } from "../app.ts";

// This is just one way to store game objects. You don't need to use this at all
export const GameObjects: { [key: string]: Squid | SquidSprite | SquidText | SquidGraphic | null } = {
	player: null,
	velocity: null,
	tutorial: null,
};

export default function Game() {
	WorldContainer.removeChildren();

	// This is manual cleanup. Mostly for development purposes.
	for (let gameObjectsKey in GameObjects) {
		let gameObject = GameObjects[gameObjectsKey];
		if (gameObject?.destroy) {
			gameObject.destroy();
		}
	}

	let player: SquidSprite | null = GameObjects.player as SquidSprite | null;
	let velocity: SquidText | null = GameObjects.velocity as SquidText | null;
	let tutorial: SquidText | null = GameObjects.tutorial as SquidText | null;

	// Call any component you want...
	player = new Slime();

	// Or just use the API directly...
	velocity = new SquidText({
		text: "Velocity: 0",
		position: new Point(20, 20),
	});
	velocity.element.anchor.set(0, 0);
	velocity.element.style.wordWrapWidth = 300;

	// Customize the text element...
	velocity.element.style.align = "left";

	// Tutorial text
	tutorial = new SquidText({
		position: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT - 50),
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

	// Add the game objects to the world container...
	WorldContainer.addChild(player, velocity, tutorial);
}