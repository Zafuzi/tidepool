import { Assets, Container, Point, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import { Viewport } from "pixi-viewport";
import { InputGamepad } from "./engine/Input";
import { initApplication, App } from "./engine/Application";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./engine/Constants";
import Game from "./game/game";

// World container - scales to fit window while maintaining aspect ratio
export let ViewportContainer: Viewport;
export let HUDContainer: Container;

export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

(async () => {
	await initApplication({
		background: "#12232f",
		roundPixels: true,
		antialias: true,
		resolution: window.devicePixelRatio,
		preference: "webgpu",
		autoDensity: true,
		resizeTo: undefined, // Automatically resize to fit window
		width: WORLD_WIDTH,
		height: WORLD_HEIGHT,
	});

	document.body.appendChild(App.canvas);

	ViewportContainer = new Viewport({
		screenWidth: WORLD_WIDTH,
		screenHeight: WORLD_HEIGHT,
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		events: App.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
	});

	ViewportContainer.wheel({
		smooth: 100,
		interrupt: true,
		reverse: false,
		center: new Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2),
		lineHeight: 0.1,
		axis: "all",
		trackpadPinch: true,
		wheelZoom: true,
	})
		.pinch()
		.decelerate()
		.clampZoom({
			minScale: 0.35,
			maxScale: 1,
		})
		.setZoom(0.5);

	App.stage.addChild(ViewportContainer);

	HUDContainer = new Container();
	HUDContainer.position.set(0, 0);
	App.stage.addChild(HUDContainer);

	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential").then((bundle) => {
		Assets_GameEssentials.assets = bundle.assets;
	});

	// Poll for Input
	// Note: Keyboard is event-based and doesn't need update(), only Gamepad needs polling
	App.ticker.add(() => {
		InputGamepad.update();
	});

	// Initialize your game
	ViewportContainer.removeChildren();
	Game({
		viewport: ViewportContainer,
		hud: HUDContainer,
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		assets: Assets_GameEssentials,
	});
})();
