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
	TilingSprite,
} from "pixi.js";
import { App } from "./Application";
import { Direction, Magnitude } from "./Math.ts";

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

	public update: null | ((...args: any[]) => void) = null;

	private tickerCallback?: (time: Ticker) => void;

	constructor(options: EntityOptions = {}) {
		super();
		const { position, alive } = options;

		this.x = position?.x || 0;
		this.y = position?.y || 0;
		this.alive = alive ?? true;
		this.interactiveChildren = false;

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

	newtonian(ticker: Ticker) {
		const deltaTime = ticker.deltaTime;

		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;

		let speed = Magnitude(this.velocity.x, this.velocity.y);
		let angle = Direction(this.velocity.y, this.velocity.x);

		if (speed > this.friction.x) {
			speed -= this.friction.x;
		} else {
			speed = 0;
		}

		this.velocity.x = Math.cos(angle) * speed;
		this.velocity.y = Math.sin(angle) * speed;

		this.rotation_velocity *= 1 - this.rotation_friction;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		this.rotation += DEG_TO_RAD * this.rotation_velocity * deltaTime;
	}

	forward(worldVelocity: Point): Point {
		// Transform velocity from world space to local space
		// Rotate the velocity vector by the negative of the entity's rotation
		const cos = Math.cos(-this.rotation);
		const sin = Math.sin(-this.rotation);
		const localVelX = worldVelocity.x * cos - worldVelocity.y * sin;
		const localVelY = worldVelocity.x * sin + worldVelocity.y * cos;

		return new Point(localVelX, localVelY);
	}
}

export type EntitySpriteOptions = {
	fileName: string;
	isTiling?: boolean;
	tileWidth?: number;
	tileHeight?: number;
};

export class EntitySprite extends Entity {
	public sprite: Sprite = new Sprite();
	public tileSprite: TilingSprite = new TilingSprite();
	public isTiling = false;
	public fileName: string;

	constructor(options: EntityOptions & EntitySpriteOptions) {
		super(options);

		this.fileName = options.fileName;
		this.isTiling = options.isTiling ?? false;
		this.tileSprite.width = options.tileWidth || 0;
		this.tileSprite.height = options.tileHeight || 0;

		if (this.isTiling) {
			this.tileSprite.texture = Assets.get(this.fileName);
			this.addChild(this.tileSprite);
		} else {
			this.sprite.texture = Assets.get(this.fileName);
			this.addChild(this.sprite);
		}
	}
}

export type EntityTextOptions = {
	text: string;
	style?: HTMLTextStyleOptions;
};

// TODO: rewrite to use BitMap Text for performance if needed
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
