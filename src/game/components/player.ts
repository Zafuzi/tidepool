import { Assets, Point, Ticker } from "pixi.js";
import {
	Cartesian,
	Clamp,
	EntityGraphic,
	EntitySprite,
	InputMoveAction,
	WORLD_HEIGHT,
	WORLD_WIDTH,
} from "../../engine/Engine.ts";
import { Sound } from "@pixi/sound";

export class Player extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });
	private hud_velocity: HTMLElement = (globalThis as any).player_stats_velocity;
	private motion_sound: Sound;

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

		this.motion_sound = Sound.from(Assets.get("movement"));
		this.motion_sound.addSprites("rotate", { start: 0, end: 1 });
		this.motion_sound.addSprites("thrust", { start: 3, end: 5 });
		this.motion_sound.volume = 1;
		this.motion_sound.autoPlayStart();

		this.motion_sound.play("rotate");
		console.log(this.motion_sound);

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

		this.hud_velocity.innerHTML = `${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)}`;
		if (!this.motion_sound.isPlaying && this.motion_sound.isPlayable) {
			const snd = thrust !== 0 ? "thrust" : rotational_thrust !== 0 ? "rotate" : null;

			if (snd) {
				this.motion_sound.play(snd);
			}
		}
	};
}
