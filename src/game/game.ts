import { Point } from "pixi.js";
import { App } from "../core/App.ts";
import { Squid, SquidGraphic, SquidSprite, SquidText } from "../core/Squids.ts";
import { Slime } from "./components/slime";

// This is just one way to store game objects. You don't need to use this at all
export const GameObjects: { [key: string]: Squid | SquidSprite | SquidText | SquidGraphic | null } = {
	player: null,
	velocity: null,
};

export default function Game() {
	App.stage.removeChildren();

	// This is manual cleanup. Mostly for development purposes.
	for (let gameObjectsKey in GameObjects) {
		let gameObject = GameObjects[gameObjectsKey];
		if (gameObject?.destroy) {
			gameObject.destroy();
		}
	}

	let player = GameObjects.player as SquidSprite;
	let velocity = GameObjects.velocity as SquidText;

	// Call any component you want...
	player = new Slime();

	// Or just use the API directly...
	velocity = new SquidText({
		text: "Velocity: 0",
		position: new Point(20, 20),
	});

	// Customize the text element...
	velocity.element.style.align = "left";

	// Customize the update function...
	velocity.update = () => {
		if (player && velocity?.element) {
			velocity.element.text = `<strong>Velocity: ${player.velocity.x.toPrecision(2)}, ${player.velocity.y.toPrecision(2)}</strong>`;
		}
	};

	// Add the game objects to the stage...
	App.stage.addChild(player, velocity);
}