import { Application } from "pixi.js";
import { Slime } from "./components/slime.ts";

export const App = new Application();
(async () => {
	await App.init({
		background: "#1a1a1a",
		resizeTo: window,
		roundPixels: false,
		antialias: true,
		bezierSmoothness: 1,
		resolution: 1,
		preference: "webgpu",
	});

	document.body.appendChild(App.canvas);
	for (let i = 0; i < 10; i++) {
		new Slime();
	}
})();
