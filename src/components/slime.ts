import { Point, Ticker } from "pixi.js";
import { App, AssetCache } from "../game.ts";
import { Squid } from "../lib/Squids.ts";

export class Slime extends Squid {
	private rot_vel: number = Math.random() > 0.5 ? Math.random() : -Math.random();

	constructor(index: number) {
		const randx = Math.random();
		const randy = Math.random();
		// Load multiple assets
		const idx = Math.floor(Math.random() * AssetCache.images.length);
		const randImg = AssetCache.images[idx];

		if (!randImg?.texture) {
			throw new Error("failed to load texture");
		}
		super(randImg.texture, Math.random() * App.screen.width, Math.random() * App.screen.height);

		this.anchor.set(0.5);
		this.velocity = new Point(randx > 0.5 ? randx * 2 : randx * -2, randy > 0.5 ? randy * 2 : randy * -2);
		this.scale = new Point(randx, randx);
		this.alpha = (Math.random() * index) / 100;
		this.zIndex = index;
	}

	onReady() {
		App.stage.addChild(this);
		App.ticker.add((time) => {
			this.update(time);
		});
	}

	update(time: Ticker) {
		Squid.wrap(this);
		this.x += this.velocity.x * time.deltaTime;
		this.y += this.velocity.y * time.deltaTime;

		this.rotation += this.rot_vel / 100;
	}
}
