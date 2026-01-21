import type { Viewport } from "pixi-viewport";
import { DEG_TO_RAD, Point, type Ticker } from "pixi.js";
import { EntityGraphic } from "./Entity.ts";
import { NumberInRange } from "./Math.ts";

export class Spawner {}

export const spawn = function (viewport: Viewport, worldHeight: number, worldWidth: number) {
	// generate some random shapes
	for (let i = 0; i < 1_000; i++) {
		const shape = new EntityGraphic({
			position: new Point(
				NumberInRange(-worldWidth * 10, worldHeight * 10),
				NumberInRange(-worldHeight * 10, worldHeight * 10),
			),
		});
		shape.graphics.circle(0, 0, 10);
		// random color
		shape.graphics.fill(NumberInRange(0x000000, 0xffffff));
		// random alpha
		shape.graphics.alpha = NumberInRange(0.1, 1);
		// random scale
		shape.graphics.scale.set(NumberInRange(0.1, 2), NumberInRange(0.1, 2));
		// random rotation
		shape.rotation = NumberInRange(0, 360);
		viewport.addChild(shape);
		shape.update = (time: Ticker) => {
			shape.rotation += DEG_TO_RAD * NumberInRange(0.01, 0.8) * time.deltaTime;
		};
	}
};
