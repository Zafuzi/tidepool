import { Application, Assets, Texture } from "pixi.js";
import { Slime } from "./components/slime.ts";
import { Jellyfish } from "./components/jellyfish.ts";

export const App = new Application();

export const AssetCache = {
	images: [
		{ file: "baiji.png", texture: new Texture() },
		{ file: "clam.png", texture: new Texture() },
		{ file: "coral-brain-big.png", texture: new Texture() },
		{ file: "coral-brain-sm.png", texture: new Texture() },
		{ file: "jelly-spotted.png", texture: new Texture() },
		{ file: "jellyfish-lion.png", texture: new Texture() },
		{ file: "jellyfish-n.png", texture: new Texture() },
		{ file: "manta-ray.png", texture: new Texture() },
		{ file: "moon1.png", texture: new Texture() },
		{ file: "moon2.png", texture: new Texture() },
		{ file: "moon3.png", texture: new Texture() },
		{ file: "nudibranch.png", texture: new Texture() },
		{ file: "octopus.png", texture: new Texture() },
		{ file: "pilot-fish.png", texture: new Texture() },
		{ file: "sea-turtle-l.png", texture: new Texture() },
		{ file: "sea-turtle.png", texture: new Texture() },
		{ file: "spider-crab.png", texture: new Texture() },
		{ file: "squid-c.png", texture: new Texture() },
		{ file: "squid-g.png", texture: new Texture() },
		{ file: "swordfish.png", texture: new Texture() },
	],
};

export function NumberInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function CoinFlip(): boolean {
	return NumberInRange(0, 1) > 0.5;
}

(async () => {
	// Initialize the asset system
	await Assets.init({});

	await App.init({
		background: "#12232f",
		resizeTo: window,
		roundPixels: false,
		antialias: true,
		bezierSmoothness: 1,
		resolution: 1,
		preference: "webgpu",
	});

	document.body.appendChild(App.canvas);

	for (let asset of AssetCache.images) {
		asset.texture = await Assets.load(`./random-ocean-mix/${asset.file}`)
			.then((t) => t)
			.catch((e: Error) => console.error(e));
	}

	for (let i = 0; i < App.screen.height / 4; i++) {
		new Slime(i);
		new Jellyfish(i);
	}
})();
