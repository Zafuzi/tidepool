import { Point, Ticker } from "pixi.js";
import { App } from "../../core/App.ts";
import { InputMoveAction } from "../../core/Input.ts";
import { cartes, clamp } from "../../core/Math.ts";
import { Squid, Squids } from "../../core/Squids.ts";

export class Slime extends Squid {
	constructor() {
		super("slime", new Point(App.screen.width / 2, App.screen.height / 2));

		this.anchor.set(0.5);
		this.velocity.set(0.5, 0);

		App.stage.addChild(this);
	}

	update(time: Ticker) {
		Squids.wrap(this);

		const [moveX, moveY] = InputMoveAction.value;
		const pos = cartes(this.rotation);
		const thrust = clamp(moveY, 0, 0.5);
		this.velocity = this.velocity.add(pos.multiplyScalar(-thrust * 0.1));
		this.rotation_velocity = moveX * 3;

		Squids.newtonian(this, time.deltaTime, 0.999);
	}
}
