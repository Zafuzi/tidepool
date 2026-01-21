import { Application, type ApplicationOptions } from "pixi.js";

// Game container instance - initialized via init()
export const App: Application = new Application();

export async function initApplication(options: Partial<ApplicationOptions>): Promise<void> {
	await App.init(options);
}
