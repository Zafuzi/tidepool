import { Point, Ticker } from "pixi.js";
import { App } from "../game.ts";
import { Squid } from "../lib/Squids.ts";
import slimeURL from "../public/slime1.png";

export class Slime extends Squid {
	private rot_vel: number = Math.random() > 0.5 ? Math.random() * 0.1 : Math.random() * -0.1;
	private fade_rate: number = Math.random() < 0.5 ? Math.random() * 0.999 : Math.random() * -0.999;

	constructor() {
		const randx = Math.random();
		const randy = Math.random();
		super(slimeURL, Math.random() * App.screen.width, Math.random() * App.screen.height);

		this.anchor.set(0.5);
		this.velocity = new Point(randx > 0.5 ? randx * 10 : randx * -10, randy > 0.5 ? randy * 10 : randy * -10);
		this.scale = new Point(randx, randx);
	}

	onReady() {
		App.stage.addChild(this);
		App.ticker.add((time) => {
			this.update(time);
		});
	}

	update(time: Ticker) {
		if (this.x > App.screen.width + this.width) {
			this.x = -this.height;
		}
		if (this.x < -this.height) {
			this.x = App.screen.width + this.width;
		}

		if (this.y > App.screen.height + this.height) {
			this.y = -this.height;
		}

		if (this.y < -this.height) {
			this.y = App.screen.height + this.height;
		}

		this.x += this.velocity.x * time.deltaTime;
		this.y += this.velocity.y * time.deltaTime;

		this.velocity.x *= this.fade_rate;
		this.velocity.y *= this.fade_rate;

		this.rotation += this.rot_vel * time.deltaTime;
	}
}
