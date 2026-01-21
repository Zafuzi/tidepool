import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ command }) => ({
	plugins: command === "build" ? [viteSingleFile()] : [],
	build: {
		target: "esnext",
	},
	esbuild: {
		supported: {
			"top-level-await": true,
		},
	},
	server: {
		hmr: {
			overlay: true,
		},
	},
}));
