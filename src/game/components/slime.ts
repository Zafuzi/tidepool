import { Point, Ticker } from "pixi.js";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../engine/Constants";
import { EntityGraphic, EntitySprite, EntityUtils } from "../../engine/Entity";
import { InputMoveAction } from "../../engine/Input";
import { cartes, clamp } from "../../engine/Math";

export class Slime extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });

	constructor() {
		super({
			fileName: "slime",
			position: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2),
		});

		this.init("slime").then(() => {
			this.sprite.anchor.set(0.5);
			this.friction.set(1 / 60);
			this.rotation_friction = 1 / 60;

			this.front.graphics.circle(0, 0, 10);
			this.front.graphics.fill(0x00ff00);
			this.front.position.set(0, -this.height / 2);

			this.addChild(this.front);
		});
	}

	update = (ticker: Ticker) => {
		const [moveX, moveY] = InputMoveAction.value;

		const pos = cartes(this.rotation);
		const thrust = clamp(moveY, 0, 0.1);
		const rotational_thrust = clamp(moveX, -0.1, 0.1);

		this.acceleration = pos.multiplyScalar(-thrust);
		this.rotation_velocity += rotational_thrust;

		EntityUtils.newtonian(this, ticker);
	};
}
