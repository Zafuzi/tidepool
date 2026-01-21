import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => {
	const plugins = [vue()];
	if (command === "build") {
		plugins.push(viteSingleFile());
	}
	return {
		plugins,
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
	};
});
