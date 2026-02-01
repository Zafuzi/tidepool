import { Viewport } from "pixi-viewport";
import { Point, Ticker } from "pixi.js";
import "pixi.js/math-extras";
import { App } from "./engine/Engine.ts";
import Game from "./game/game.ts";
import { initDevtools } from "@pixi/devtools";

// World container - scales to fit window while maintaining aspect ratio
export let ViewportContainer: Viewport;

(async () => {
	await initDevtools({ app: App });

	await App.init({
		background: "#000",
		roundPixels: true,
		antialias: false,
		useBackBuffer: false,
		resolution: window.devicePixelRatio,
		autoDensity: true,
		resizeTo: window, // Automatically resize to fit window
		width: App.WORLD_WIDTH,
		height: App.WORLD_HEIGHT,
		clearBeforeRender: false,
		sharedTicker: true,
		powerPreference: "high-performance",
		canvas: document.querySelector("#game_canvas") as HTMLCanvasElement,
	});

	ViewportContainer = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: App.WORLD_WIDTH,
		worldHeight: App.WORLD_HEIGHT,
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
			center: new Point(App.WORLD_WIDTH / 2, App.WORLD_HEIGHT / 2),
			lineHeight: 0.1,
			axis: "all",
			trackpadPinch: true,
			wheelZoom: true,
		})
		.pinch()
		.decelerate();

	// Initialize your game
	App.stage.addChild(ViewportContainer);

	App.ticker.add((ticker: Ticker) => {
		App.tick++;
	});

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
