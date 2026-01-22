import { EntitySprite } from "../../engine/Engine.ts";
import { Point, Ticker } from "pixi.js";

export class Squid extends EntitySprite {

    constructor() {
        super({
            fileName: "squid",
            position: new Point(0, 0),
        });
    }

    update = (ticker: Ticker) => {
        this.newtonian(ticker);
    }
}