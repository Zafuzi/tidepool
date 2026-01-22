import { EntitySprite } from "../../engine/Engine.ts";
import { Cartesian, Clamp } from "../../engine/Math.ts";
import { Point, Ticker } from "pixi.js";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../engine/Engine.ts";
import { EntityGraphic } from "../../engine/Entity.ts";
import { Azimuth, CoinFlip, NumberInRange } from "../../engine/Math.ts";
import { App } from "../../engine/Engine.ts";
import { Player } from "./player.ts";


export class Squid extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });

    private age: number = 0;

    constructor() {
        super({
            fileName: "squid",
			position: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2),
        });

		this.sprite.anchor.set(0.5);
		this.friction = new Point(0.01, 0.01);
		this.rotation_friction = 1 / 60;

		this.addChild(this.front);
    }

    update = (ticker: Ticker) => {
        
        this.age += 1;
        
        if (App.tick % 100 === 0 ) {
            // thrust in the rotation direction
            const pos = Cartesian(this.rotation);
            this.velocity = pos.multiplyScalar(-1.4);
        }

        if (this.age % 133 === 0 ) {
            if(CoinFlip()) {
                // rotate to face player
                const player = App.stage.children.find(child => child instanceof Player);
                if (player) {
                    const playerPos = new Point(player.x, player.y);
                    const playerDir = Azimuth(this.position, playerPos);
                    this.rotation = playerDir;
                }
            } else {
                // rotate to a random direction
                this.rotation = NumberInRange( 0, Math.PI * 2 );
            }
        }

		this.newtonian(ticker);
	};
}