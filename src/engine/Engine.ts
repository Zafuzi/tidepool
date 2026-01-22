// Engine exports - import everything you need from here
import { Application, Ticker } from "pixi.js";

// Game container instance - initialized via init()

export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;

export class Engine extends Application {
    public tick: number = 0;

    constructor() {
        super();
    }
}

export const App = new Engine();

export * from "./Entity";
export * from "./Input";
export * from "./Math";
