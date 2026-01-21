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
import { GameContainer, WORLD_WIDTH, WORLD_HEIGHT } from "./Constants";

export class Squids {
	static wrap(squid: Squid) {
		if (squid.x > WORLD_WIDTH + squid.width / 2) {
			squid.x = -squid.width / 2;
		}
		if (squid.x < -squid.width / 2) {
			squid.x = WORLD_WIDTH + squid.width / 2;
		}

		if (squid.y > WORLD_HEIGHT + squid.height / 2) {
			squid.y = -squid.height / 2;
		}

		if (squid.y < -squid.height / 2) {
			squid.y = WORLD_HEIGHT + squid.height / 2;
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

	static forward(squid: Squid, worldVelocity: Point): Point {
		// Transform velocity from world space to local space
		// Rotate the velocity vector by the negative of the squid's rotation
		const cos = Math.cos(-squid.rotation);
		const sin = Math.sin(-squid.rotation);
		const localVelX = worldVelocity.x * cos - worldVelocity.y * sin;
		const localVelY = worldVelocity.x * sin + worldVelocity.y * cos;

		return new Point(localVelX, localVelY);
	}

	static radius(squid: Squid): number {
		return Math.max(squid.width, squid.height);
	}
}

export type SquidOptions = {
	position?: Point;
	alive?: boolean;
};

export class Squid extends Container {
	public alive: boolean = true;
	public velocity: Point = new Point(0, 0);
	public rotation_velocity: number = 0;

	private tickerCallback?: (time: Ticker) => void;

	constructor(options: SquidOptions) {
		super();
		let { position, alive } = options;

		this.x = position?.x || 0;
		this.y = position?.y || 0;
		this.alive = alive ?? true;

		this.tickerCallback = (time: Ticker) => {
			if (this.alive) {
				this.update(time);
			}
		};

		GameContainer.ticker.add(this.tickerCallback);
	}

	async init(...args: any[]): Promise<void> { }

	update(_time: Ticker) { }

	destroy(): void {
		if (this.tickerCallback) {
			GameContainer.ticker.remove(this.tickerCallback);
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

export type SquidSpriteOptions = {
	fileName: string;
};
export class SquidSprite extends Squid {
	public sprite: Sprite = new Sprite();

	constructor(options: SquidOptions & SquidSpriteOptions) {
		super(options);
		const { fileName } = options;
		this.init(fileName);
	}
	async init(fileName: string) {
		const t = await Assets.load(fileName)
		this.sprite.texture = t;
		this.addChild(this.sprite);
	}
}

export type SquidTextOptions = {
	text: string;
	style?: HTMLTextStyleOptions;
};
export class SquidText extends Squid {
	public element: HTMLText;

	constructor(options: SquidOptions & SquidTextOptions) {
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

export type SquidGraphicOptions = {};

export class SquidGraphic extends Squid {
	public graphics: Graphics;

	constructor(options: SquidOptions & SquidGraphicOptions) {
		super(options);
		this.graphics = new Graphics();
		this.addChild(this.graphics);
	}
}
