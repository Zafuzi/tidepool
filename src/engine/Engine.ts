// Engine exports - import everything you need from here
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";

// Game container instance - initialized via init()

export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
export const App: Application = new Application();

await initDevtools({
    app: App,
});

export * from "./Entity";
export * from "./Input";
export * from "./Math";
