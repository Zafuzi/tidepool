import { Assets, Point, Sprite, Texture, Ticker } from "pixi.js";
import { App } from "../game";

export class Squid extends Sprite {
	private vel: Point = new Point(0, 0);

	constructor(texture: Texture, x?: number, y?: number) {
		super();

		this.texture = texture;

		this.x = x || 0;
		this.y = y || 0;

		this.onReady();
	}

	get velocity() {
		return this.vel;
	}

	set velocity(p: Point) {
		this.vel = p;
	}

	onReady() {}
	update(_time: Ticker) {}
	static wrap(squid: Squid) {
		if (squid.x > App.screen.width + squid.width) {
			squid.x = -squid.height;
		}
		if (squid.x < -squid.height) {
			squid.x = App.screen.width + squid.width;
		}

		if (squid.y > App.screen.height + squid.height) {
			squid.y = -squid.height;
		}

		if (squid.y < -squid.height) {
			squid.y = App.screen.height + squid.height;
		}
	}
}
