import { type Application, Point } from "pixi.js";
import { App } from "../core/App";
import { SquidText } from "../core/Text";
import { Slime } from "./components/slime";

let player: Slime | null = null;
let velocity: SquidText | null = null;

function initGame(_App: Application) {
	// Clean up existing instances on re-execution
	if (player) {
		App.stage.removeChild(player);
		player.destroy();
	}
	if (velocity) {
		App.stage.removeChild(velocity.element);
		velocity.element.destroy();
		velocity.destroy();
	}

	player = new Slime();
	velocity = new SquidText("Velocity: 0", new Point(20, 20), {
		fontFamily: "Arial",
		fontSize: 24,
		fill: "#fafafa",
		align: "left",
	});

	velocity.update = () => {
		if (player && velocity) {
			velocity.element.text = `<strong>Velocity: ${player.velocity.x.toPrecision(2)}, ${player.velocity.y.toPrecision(2)}</strong>`;
		}
	};
}

export default initGame;
