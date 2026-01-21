import { Point, Ticker } from "pixi.js";
import { InputMoveAction } from "../../core/Input.ts";
import { cartes, clamp } from "../../core/Math.ts";
import { SquidGraphic, Squids, SquidSprite } from "../../core/Squids.ts";
import { GameApp } from "../../app.ts";

export class Slime extends SquidSprite {
	private front: SquidGraphic = new SquidGraphic({ position: new Point(0, 0) });

	constructor() {
		super({
			fileName: "slime",
			position: new Point(GameApp.screen.width / 2, GameApp.screen.height / 2),
		})

		this.init("slime").then(() => {
			this.sprite.anchor.set(0.5);
			this.velocity.set(0, 0);

			this.front.graphics.circle(0, 0, 10);
			this.front.graphics.fill(0x00ff00);
			this.front.position.set(0, -this.height / 2);

			this.addChild(this.front);
		});
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
