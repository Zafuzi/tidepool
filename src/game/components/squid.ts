import { EntitySprite } from "../../engine/Engine.ts";
import { Cartesian } from "../../engine/Math.ts";
import { Point, Ticker } from "pixi.js";
import { EntityGraphic } from "../../engine/Entity.ts";
import { Azimuth, Roll } from "../../engine/Math.ts";
import { App } from "../../engine/Engine.ts";
import { Player } from "./player.ts";


export class Squid extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });

    private age: number = 0;
	private player: Player;

    constructor(player: Player) {
        super({
            fileName: "squid",
			position: new Point(App.WORLD_WIDTH / 2, App.WORLD_HEIGHT / 2),
        });

		this.player = player;
		this.sprite.anchor.set(0.5);
		this.friction = new Point(0.005, 0.005);
		this.rotation_friction = 1 / 60;

		this.addChild(this.front);
    }

    update = (ticker: Ticker) => {
        
        this.age += 1;

        if (Roll(50) === 0 ) {
            // thrust in the rotation direction
            const pos = Cartesian(this.rotation);
            this.velocity = pos.multiplyScalar(-3.0);
        }

        console.log("Rotating to player");
        const playerDir = Azimuth(this.position, this.player.position);
        this.rotation = playerDir;
        console.log("playerDir", playerDir);

		this.newtonian(ticker);
	};
}