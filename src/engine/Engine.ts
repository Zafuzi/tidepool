// Engine exports - import everything you need from here
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";

// Game container instance - initialized via init()

export const App: Application = new Application();
await initDevtools({
    app: App,
});

export * from "./Constants";
export * from "./Entity";
export * from "./Input";
export * from "./Math";
