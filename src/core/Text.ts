import { HTMLText, Point, type HTMLTextStyleOptions } from "pixi.js";
import { App } from "./core";
import { Squid } from "./Squids";

export class SquidText extends Squid {
	public element: HTMLText;

	constructor(content: string, pos: Point, style: HTMLTextStyleOptions) {
		super(undefined, pos);

		this.element = new HTMLText({
			text: content ?? "",
			style: style ?? {
				fontFamily: "Arial",
				fontSize: 24,
				fill: "#ff1010",
				align: "center",
			},
		});

		this.element.position = new Point(20, 20);

		App.stage.addChild(this.element);
	}
}
