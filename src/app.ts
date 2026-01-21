import { Application, Assets, Container, type AssetsBundle } from "pixi.js";
import "pixi.js/math-extras";
import Game from "./game/game";
import { InputGamepad } from "./core/Input";

export const GameApp = new Application();

export const Assets_GameEssentials: AssetsBundle = {
	name: "game-essential",
	assets: [],
};

// Fixed world dimensions - this is your "logical" game world size
// All game objects use these dimensions for positioning
export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;

// World container - scales to fit window while maintaining aspect ratio
export const WorldContainer = new Container();

(async () => {
	await GameApp.init({
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

	// Set up world container
	WorldContainer.width = WORLD_WIDTH;
	WorldContainer.height = WORLD_HEIGHT;

	GameApp.stage.addChild(WorldContainer);

	// Function to scale world container to fit current window size
	const updateWorldScale = () => {
		const width = GameApp.screen.width;
		const height = GameApp.screen.height;

		const scaleX = width / WORLD_WIDTH;
		const scaleY = height / WORLD_HEIGHT;
		const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

		WorldContainer.scale.set(scale);
		WorldContainer.x = (width - WORLD_WIDTH * scale) / 2;
		WorldContainer.y = (height - WORLD_HEIGHT * scale) / 2;
	};

	// Update scale initially and on resize
	updateWorldScale();
	window.addEventListener("resize", updateWorldScale);

	const canvas = GameApp.canvas;
	document.body.appendChild(canvas);

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