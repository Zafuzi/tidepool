import { Viewport } from "pixi-viewport";
import { Point, Ticker } from "pixi.js";
import "pixi.js/math-extras";
import { App, WORLD_HEIGHT, WORLD_WIDTH } from "./engine/Engine.ts";
import Game from "./game/game.ts";

// World container - scales to fit window while maintaining aspect ratio
export let ViewportContainer: Viewport;

(async () => {
	await App.init({
		background: "#000",
		roundPixels: true,
		antialias: false,
		useBackBuffer: false,
		resolution: window.devicePixelRatio,
		autoDensity: true,
		resizeTo: window, // Automatically resize to fit window
		width: WORLD_WIDTH,
		height: WORLD_HEIGHT,
		clearBeforeRender: false,
		sharedTicker: true,
		powerPreference: "high-performance",
		canvas: document.querySelector("#game_canvas") as HTMLCanvasElement,
	});

	ViewportContainer = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
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

	// Initialize your game
	App.stage.addChild(ViewportContainer);

	App.elapsed = 0;
	App.ticker.add((ticker: Ticker) => {
		App.elapsed! += Math.floor(ticker.elapsedMS)
	})

	await Game(ViewportContainer);

	let resizeDebounce: number;
	window.addEventListener("resize", () => {
		if (resizeDebounce) {
			clearTimeout(resizeDebounce);
		}

		resizeDebounce = setTimeout(() => {
			App.renderer.resize(window.innerWidth, window.innerHeight);

			ViewportContainer.screenWidth = App.screen.width;
			ViewportContainer.screenHeight = App.screen.height;
			ViewportContainer.resize(App.screen.width, App.screen.height, WORLD_WIDTH, WORLD_HEIGHT);
		}, 300);
	});
})();
