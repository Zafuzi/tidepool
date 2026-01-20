import { Assets, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import { App } from "./App";
import { InputGamepad } from "./Input";
import Game from "../game/game";

export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

async function init() {
	await App.init({
		background: "#12232f",
		resizeTo: window,
		roundPixels: false,
		antialias: false,
		bezierSmoothness: 1,
		resolution: window.devicePixelRatio,
		preference: "webgpu",
		autoDensity: true,
	});
	document.body.appendChild(App.canvas);

	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential").then((bundle) => {
		Assets_GameEssentials.assets = bundle.assets;
	});

	App.ticker.add(() => {
		InputGamepad.update();
	});

	Game(App);
}

init();
