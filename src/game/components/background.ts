import type { Viewport } from "pixi-viewport";
import { EntitySprite, type EntitySpriteOptions, WORLD_HEIGHT, WORLD_WIDTH } from "../../engine/Engine.ts";

export default class Background extends EntitySprite {
	constructor(options: EntitySpriteOptions) {
		options.isTiling = true;

		super(options);

		this.zIndex = -1;
		this.position.set(0, 0);
		this.tileSprite.setSize(WORLD_WIDTH, WORLD_HEIGHT);
	}

	onViewportMoved = (viewport: Viewport, worldWidth: number, worldHeight: number) => {
		if (this.tileSprite && viewport.scale) {
			this.tileSprite.position.set(viewport.left, viewport.top);
			this.tileSprite.width = worldWidth / viewport.scale.x;
			this.tileSprite.height = worldHeight / viewport.scale.y;
			this.tileSprite.tilePosition.x = -viewport.left;
			this.tileSprite.tilePosition.y = -viewport.top;
		}
	};
}
