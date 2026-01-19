import { Point, Texture, Ticker } from "pixi.js";
import { App, AssetCache, CoinFlip, NumberInRange } from "../game.ts";
import { Squid } from "../lib/Squids.ts";

export class Jellyfish extends Squid {
	constructor(index: number) {
		let tex = CoinFlip() ? "jellyfish-lion.png" : "jellyfish-n.png";
		super(
			AssetCache.images.find(({ file }) => file == tex)?.texture || new Texture(),
			Math.random() * App.screen.width,
			Math.random() * App.screen.height,
		);

		this.anchor.set(0.5);
		const rand = NumberInRange(0.4, 3);
		const flip = CoinFlip();
		this.velocity = new Point(flip ? -rand : rand, flip ? rand : -rand);
		this.scale = new Point(rand, rand);
		this.alpha = NumberInRange(0.8, 1);
		this.zIndex = index;
	}

	onReady() {
		App.stage.addChild(this);
		App.ticker.add((time) => {
			this.update(time);
		});

		setInterval(
			() => {
				CoinFlip() ? (this.velocity.x *= -1) : (this.velocity.y *= -1);
			},
			NumberInRange(1, 100) * 1_000,
		);
	}

	update(time: Ticker) {
		Squid.wrap(this);

		this.x += this.velocity.x * time.deltaTime;
		this.y += this.velocity.y * time.deltaTime;
	}
}
