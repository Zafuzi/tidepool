import { createApp } from "vue";
import Settings from "./components/Settings.vue";
import { Application, Assets, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import Game from "./game/game";
import { InputGamepad } from "./core/Input";

export const GameApp = new Application();
export const UIApp = createApp(Settings);
UIApp.mount("#app");

export const resolutionMap: Record<string, { width: number; height: number }> = {
	"480p": { width: 854, height: 480 },
	"720p": { width: 1280, height: 720 },
	"960p": { width: 1280, height: 960 },
	"1080p": { width: 1920, height: 1080 },
	"1440p": { width: 2560, height: 1440 },
	"2160p": { width: 3840, height: 2160 },
};

export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

(async () => {
	let targetWidth = 1280;
	let targetHeight = 720;

	await GameApp.init({
		background: "#12232f",
		roundPixels: true,
		antialias: true,
		resolution: window.devicePixelRatio,
		preference: "webgpu",
		autoDensity: true,
		width: targetWidth,
		height: targetHeight,
	});

	// maintain aspect ratio
	const canvas = GameApp.canvas;
	canvas.style.aspectRatio = `${targetWidth} / ${targetHeight}`;
	canvas.style.width = `${targetWidth}px`;
	canvas.style.height = `${targetHeight}px`;

	document.body.appendChild(canvas);

	// Listen for resolution changes
	window.addEventListener(
		"resolution-change",
		((event: CustomEvent<{ width: number; height: number }>) => {
			const { width, height } = event.detail;

			// Update PixiJS app resolution
			targetWidth = width;
			targetHeight = height;

			// Update canvas size
			canvas.style.aspectRatio = `${targetWidth} / ${targetHeight}`;
			canvas.style.width = `${targetWidth}px`;
			canvas.style.height = `${targetHeight}px`;

			// Resize the renderer
			GameApp.renderer.resize(targetWidth, targetHeight);
		}) as EventListener,
	);

	// Load your assets
	await Assets.init({ manifest: "./manifest.json" });
	await Assets.loadBundle("game-essential").then((bundle) => {
		Assets_GameEssentials.assets = bundle.assets;
	});

	// Poll for Input
	// Note: Keyboard is event-based and doesn't need update(), only Gamepad needs polling
	GameApp.ticker.add(() => {
		InputGamepad.update();
	});

	// Initiliaze your game
	Game();
})();