import { Assets, Point, Sprite, Texture, Ticker } from "pixi.js";

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
}
