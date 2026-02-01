// Engine exports - import everything you need from here
import { Application } from "pixi.js";

// Game container instance - initialized via init()

export class Engine extends Application {
	public tick: number = 0;

	constructor() {
		super();
	}

	get WORLD_WIDTH(): number {
		return window.innerWidth;
	}

	get WORLD_HEIGHT(): number {
		return window.innerHeight;
	}
}

export const App = new Engine();

export * from "./Entity";
export * from "./Input";
export * from "./Math";
