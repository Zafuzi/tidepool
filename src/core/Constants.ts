import { Application } from "pixi.js";

// Fixed world dimensions - this is your "logical" game world size
// All game objects use these dimensions for positioning
export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;

// Game container instance - initialized in app.ts
export const GameContainer: Application = new Application();
