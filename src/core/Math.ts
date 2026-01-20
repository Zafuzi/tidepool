import { Point } from "pixi.js";

export function NumberInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function CoinFlip(): boolean {
	return NumberInRange(0, 1) > 0.5;
}

// converts a heading/angle to cartesion coords for a distance of 1.0
// passing in a vec as 'v' makes it write into that vec rather than
// creating a new one.
export const cartes = function (az: number, v?: Point) {
	az = az - Math.PI;
	if (!v) return new Point(Math.sin(az), -Math.cos(az));
	v.x = Math.sin(az);
	v.y = -Math.cos(az);
	return v;
};

// takes a source position and a target position and
// returns a number from 0.0 thru PI * 2 that represents the angle
// between the two, or the "heading" from source to target
export const azimuth = function (s_pos: Point, t_pos: Point) {
	return Math.atan2(t_pos.y - s_pos.y, t_pos.x - s_pos.x) + Math.PI / 2;
};

export const clamp = function (num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max);
};

export const clampPoint = function (p: Point, min: number, max: number) {
	p.x = clamp(p.x, min, max);
	p.y = clamp(p.y, min, max);
};
