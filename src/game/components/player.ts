import { Point, Ticker } from "pixi.js";
import {
	Cartesian,
	Clamp,
	EntityGraphic,
	EntitySprite,
	InputMoveAction,
	WORLD_HEIGHT,
	WORLD_WIDTH,
} from "../../engine/Engine.ts";

export class Player extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });

	constructor() {
		super({
			fileName: "player",
			position: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2),
		});

		this.sprite.anchor.set(0.5);
		this.friction.set(1 / 60);
		this.rotation_friction = 1 / 60;

		this.front.alpha = 0.8;
		this.front.graphics.circle(0, 0, 20);
		this.front.graphics.fill(0xffffff);
		this.front.graphics.stroke({
			width: 5,
			color: 0x1a1a1a,
		});
		this.front.position.set(0, -this.height / 2 - 20);

		this.addChild(this.front);
	}

	update = (ticker: Ticker) => {
		const [moveX, moveY] = InputMoveAction.value;

		const pos = Cartesian(this.rotation);
		const thrust = Clamp(moveY, 0, 0.1);
		const rotational_thrust = Clamp(moveX, -0.1, 0.1);

		this.acceleration = pos.multiplyScalar(-thrust);
		this.rotation_velocity += rotational_thrust;

		this.newtonian(ticker);
	};
}
