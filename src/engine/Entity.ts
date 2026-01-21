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
import { WORLD_WIDTH, WORLD_HEIGHT } from "./Constants";

// Utility functions for entities
export const EntityUtils = {
	wrap(entity: Entity) {
		if (entity.x > WORLD_WIDTH + entity.width / 2) {
			entity.x = -entity.width / 2;
		}
		if (entity.x < -entity.width / 2) {
			entity.x = WORLD_WIDTH + entity.width / 2;
		}

		if (entity.y > WORLD_HEIGHT + entity.height / 2) {
			entity.y = -entity.height / 2;
		}

		if (entity.y < -entity.height / 2) {
			entity.y = WORLD_HEIGHT + entity.height / 2;
		}
	},

	newtonian(entity: Entity, deltaTime: number, friction?: number) {
		entity.velocity = entity.velocity.multiplyScalar(friction ?? 0.98);
		entity.rotation_velocity *= friction ?? 0.98;

		entity.position = entity.position.add(entity.velocity.multiplyScalar(deltaTime));
		entity.rotation += DEG_TO_RAD * entity.rotation_velocity * deltaTime;

		if (Math.abs(entity.velocity.x) < 0.01) {
			entity.velocity.x = 0;
		}

		if (Math.abs(entity.velocity.y) < 0.01) {
			entity.velocity.y = 0;
		}

		if (Math.abs(entity.rotation_velocity) < 0.01) {
			entity.rotation_velocity = 0;
		}
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
	public rotation_velocity: number = 0;

	private tickerCallback?: (time: Ticker) => void;

	constructor(options: EntityOptions = {}) {
		super();
		const { position, alive } = options;

		this.x = position?.x || 0;
		this.y = position?.y || 0;
		this.alive = alive ?? true;

		this.tickerCallback = (time: Ticker) => {
			if (this.alive) {
				this.update(time);
			}
		};

		App.ticker.add(this.tickerCallback);
	}

	async init(...args: any[]): Promise<void> {}

	update(_time: Ticker) {}

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

	async init(fileName: string) {
		const t = await Assets.load(fileName);
		this.sprite.texture = t;
		this.addChild(this.sprite);
	}
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
