import { EntitySprite } from "../../engine/Engine.ts";
import { Cartesian, Clamp } from "../../engine/Math.ts";
import { Point, Ticker } from "pixi.js";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../../engine/Engine.ts";
import { EntityGraphic } from "../../engine/Entity.ts";
import { InputMoveAction } from "../../engine/Input.ts";
import { NumberInRange } from "../../engine/Math.ts";
import { App } from "../../engine/Engine.ts";

export class Squid extends EntitySprite {
	private front: EntityGraphic = new EntityGraphic({ position: new Point(0, 0) });

    private age: number = 0;

    constructor() {
        super({
            fileName: "squid",
			position: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2),
        });

		this.sprite.anchor.set(0.5);
		this.friction.set(1 / 60);
		this.rotation_friction = 1 / 60;

		this.addChild(this.front);
    }

    update = (ticker: Ticker) => {
        
        this.age += ticker.deltaTime;

		const pos = Cartesian(this.rotation);

        // occasionally, change rotation velocity randomly
        if (Math.floor( this.age ) % 1000 ) {
            //this.acceleration = pos.multiplyScalar(-0.1);
        }

        if (App.elapsed % 1000 === 0 ) {
            // rotate to a random direction
		    this.rotation = NumberInRange( 0, Math.PI * 2 );
        }

		this.newtonian(ticker);
	};
}