import { Assets, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import Game from "../game/game.ts";
import { App } from "./App";
import { InputGamepad } from "./Input";

export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

export default async function init() {
	await App.init({
		background: "#12232f",
		resizeTo: window,
		roundPixels: true,
		antialias: true,
		resolution: window.devicePixelRatio,
		preference: "webgpu",
		autoDensity: true,
	});

	document.body.appendChild(App.canvas);

	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential").then((bundle) => {
		Assets_GameEssentials.assets = bundle.assets;
	});

	// Poll for Input
	App.ticker.add(() => {
		InputGamepad.update();
	});

	// Initiliaze your game
	Game();
}

