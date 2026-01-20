import { Application, Assets, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import Game from "../game/game";
import { InputGamepad } from "./Input";

export const App = new Application();
export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

(async () => {
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

	Game();
})();
