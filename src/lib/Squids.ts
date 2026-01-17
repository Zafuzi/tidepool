import { Assets, Point, Sprite, Ticker } from "pixi.js";

export class Squid extends Sprite {
	private vel: Point = new Point(0, 0);
	private fade: Point = new Point(0, 0);

	constructor(imagePath: string, x?: number, y?: number) {
		super();

		Assets.load(imagePath).then((texture) => {
			this.texture = texture;

			this.x = x || 0;
			this.y = y || 0;

			this.onReady();
		});
	}

	get velocity() {
		return this.vel;
	}

	set velocity(p: Point) {
		this.vel = p;
	}

	get fadeRate() {
		return this.fade;
	}

	set fadeRate(p: Point) {
		this.fade = p;
	}

	onReady() {}
	update(_time: Ticker) {}
}
