import { type Application, Point } from "pixi.js";
import { SquidText } from "../core/Text";
import { Slime } from "./components/slime";

export default function Game(_App: Application) {
	const player = new Slime();
	const velocity = new SquidText("Velocity: 0", new Point(20, 20), {
		fontFamily: "Arial",
		fontSize: 24,
		fill: "#fafafa",
		align: "left",
	});

	velocity.update = () => {
		velocity.element.text = `<strong>Velocity: ${player.velocity.x.toPrecision(2)}, ${player.velocity.y.toPrecision(2)}</strong>`;
	};
}
