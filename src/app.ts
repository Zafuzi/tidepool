import { Viewport } from "pixi-viewport";
import { Container, Point } from "pixi.js";
import "pixi.js/math-extras";
import { App, initApplication, WORLD_HEIGHT, WORLD_WIDTH } from "./engine/Engine.ts";
import Game from "./game/game.ts";

// World container - scales to fit window while maintaining aspect ratio
export let ViewportContainer: Viewport;
export let HUDContainer: Container;

(async () => {
	await initApplication({
		background: "#000",
		roundPixels: true,
		antialias: false,
		useBackBuffer: true,
		resolution: window.devicePixelRatio,
		preference: "webgpu",
		autoDensity: true,
		resizeTo: undefined, // Automatically resize to fit window
		width: WORLD_WIDTH,
		height: WORLD_HEIGHT,
		clearBeforeRender: false,
	});

	document.body.appendChild(App.canvas);

	ViewportContainer = new Viewport({
		screenWidth: WORLD_WIDTH,
		screenHeight: WORLD_HEIGHT,
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		events: App.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
		ticker: App.ticker,
	});

	ViewportContainer.clampZoom({
		minScale: 0.35,
		maxScale: 1,
	})
		.wheel({
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
		.decelerate();

	HUDContainer = new Container();

	// Initialize your game
	App.stage.addChild(ViewportContainer);
	App.stage.addChild(HUDContainer);

	await Game({
		viewport: ViewportContainer,
		hud: HUDContainer,
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
	});
})();
