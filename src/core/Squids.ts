import { Assets, DEG_TO_RAD, Point, Sprite, Texture, Ticker } from "pixi.js";
import { App } from "./App";

export class Squids {
	static wrap(squid: Squid) {
		if (squid.x > App.screen.width + squid.width / 2) {
			squid.x = -squid.width / 2;
		}
		if (squid.x < -squid.width / 2) {
			squid.x = App.screen.width + squid.width / 2;
		}

		if (squid.y > App.screen.height + squid.height / 2) {
			squid.y = -squid.height / 2;
		}

		if (squid.y < -squid.height / 2) {
			squid.y = App.screen.height + squid.height / 2;
		}
	}

	static newtonian(squid: Squid, deltaTime: number, friction?: number) {
		squid.velocity = squid.velocity.multiplyScalar(friction ?? 0.98);
		squid.rotation_velocity *= friction ?? 0.98;

		squid.position = squid.position.add(squid.velocity.multiplyScalar(deltaTime));
		squid.rotation += DEG_TO_RAD * squid.rotation_velocity * deltaTime;

		if (Math.abs(squid.velocity.x) < 0.01) {
			squid.velocity.x = 0;
		}

		if (Math.abs(squid.velocity.y) < 0.01) {
			squid.velocity.y = 0;
		}

		if (Math.abs(squid.rotation_velocity) < 0.01) {
			squid.rotation_velocity = 0;
		}
	}

	static new(fileName?: string, pos?: Point, alive?: boolean) {
		return new Squid(fileName, pos, alive);
	}
}

export class Squid extends Sprite {
	public alive: boolean = true;
	public velocity: Point = new Point(0, 0);
	public rotation_velocity: number = 0;

	constructor(fileName?: string, pos?: Point, alive?: boolean) {
		super();

		if (fileName) {
			// Check if asset is already loaded (e.g., from a bundle)
			const existingAsset = Assets.get(fileName);
			if (existingAsset) {
				// Asset is already loaded, use it directly
				this.texture = existingAsset as Texture;
			} else {
				// Asset not loaded yet, load it
				Assets.load(fileName)
					.then((t: Texture) => {
						this.texture = t;
					})
					.catch((e: Error) => console.error(e));
			}
		}

		this.x = pos?.x || 0;
		this.y = pos?.y || 0;
		this.alive = alive ?? true;

		App.ticker.add((time: Ticker) => {
			this.update(time);
		});
	}

	update(_time: Ticker) {
		if (!this.alive) {
			return;
		}
	}
}
