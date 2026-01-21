import {
	Assets,
	Container,
	DEG_TO_RAD,
	Graphics,
	HTMLText,
	type HTMLTextStyleOptions,
	Point,
	Sprite,
	Ticker,
} from "pixi.js";
import { App } from "./Application";
import { direction, magnitude } from "./Math.ts";

// Utility functions for entities
export const EntityUtils = {
	newtonian(entity: Entity, ticker: Ticker, acceleration?: Point, friction?: Point) {
		const deltaTime = ticker.deltaTime;

		entity.velocity.x += acceleration?.x || entity.acceleration.x;
		entity.velocity.y += acceleration?.y || entity.acceleration.y;

		let speed = magnitude(entity.velocity.x, entity.velocity.y);
		let angle = direction(entity.velocity.y, entity.velocity.x);

		friction = friction || entity.friction;

		if (speed > friction.x) {
			speed -= friction.x;
		} else {
			speed = 0;
		}

		entity.velocity.x = Math.cos(angle) * speed;
		entity.velocity.y = Math.sin(angle) * speed;

		entity.rotation_velocity *= 1 - entity.rotation_friction;

		entity.position.x += entity.velocity.x;
		entity.position.y += entity.velocity.y;

		entity.rotation += DEG_TO_RAD * entity.rotation_velocity * deltaTime;
	},

	forward(entity: Entity, worldVelocity: Point): Point {
		// Transform velocity from world space to local space
		// Rotate the velocity vector by the negative of the entity's rotation
		const cos = Math.cos(-entity.rotation);
		const sin = Math.sin(-entity.rotation);
		const localVelX = worldVelocity.x * cos - worldVelocity.y * sin;
		const localVelY = worldVelocity.x * sin + worldVelocity.y * cos;

		return new Point(localVelX, localVelY);
	},

	radius(entity: Entity): number {
		return Math.max(entity.width, entity.height);
	},
};

export type EntityOptions = {
	position?: Point;
	alive?: boolean;
};

export class Entity extends Container {
	public alive: boolean = true;
	public velocity: Point = new Point(0, 0);
	public acceleration: Point = new Point(0, 0);
	public friction: Point = new Point(0, 0);

	public rotation_velocity: number = 0;
	public rotation_friction: number = 0;

	public init: (...args: any[]) => void;
	public update: (time: Ticker) => void;

	private tickerCallback?: (time: Ticker) => void;

	constructor(options: EntityOptions = {}) {
		super();
		const { position, alive } = options;

		this.x = position?.x || 0;
		this.y = position?.y || 0;
		this.alive = alive ?? true;

		this.tickerCallback = (time: Ticker) => {
			if (this.alive && typeof this.update === "function") {
				this.update(time);
			}
		};

		App.ticker.add(this.tickerCallback);
	}

	destroy(): void {
		if (this.tickerCallback) {
			App.ticker.remove(this.tickerCallback);
			this.tickerCallback = undefined;
		}

		super.destroy({
			children: true,
			texture: true,
			style: true,
			context: true,
			textureSource: false, // keep this in case asset is used elsewhere
		});
	}
}

export type EntitySpriteOptions = {
	fileName: string;
};

export class EntitySprite extends Entity {
	public sprite: Sprite = new Sprite();

	constructor(options: EntityOptions & EntitySpriteOptions) {
		super(options);
		const { fileName } = options;
		this.init(fileName);
	}

	init = async (fileName: string) => {
		this.sprite.texture = await Assets.load(fileName);
		this.addChild(this.sprite);
	};
}

export type EntityTextOptions = {
	text: string;
	style?: HTMLTextStyleOptions;
};

export class EntityText extends Entity {
	public element: HTMLText;

	constructor(options: EntityOptions & EntityTextOptions) {
		super(options);

		const { text, style } = options;

		this.element = new HTMLText({
			text,
			style: style ?? {
				wordWrap: true,
				fontFamily: "Arial",
				fontSize: 24,
				fill: "#00ff00",
				align: "left",
			},
		});

		this.element.position.set(0, 0);

		this.addChild(this.element);
	}
}

export type EntityGraphicOptions = {};

export class EntityGraphic extends Entity {
	public graphics: Graphics;

	constructor(options: EntityOptions & EntityGraphicOptions = {}) {
		super(options);
		this.graphics = new Graphics();
		this.addChild(this.graphics);
	}
}
