import { DEG_TO_RAD, Point, type PointData } from "pixi.js";

export function NumberInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function CoinFlip(): boolean {
	return NumberInRange(0, 1) > 0.5;
}

// converts a heading/angle to cartesian coords for a Distance of 1.0
// passing in a vec as 'v' makes it write into that vec rather than
// creating a new one.
// JH: Again, the terms cartesion and azimuth were just my squiddy terminology,
// and don't need to be kept .. not even sure "azimuth" is the
// right word.
export const Cartesian = function (az: number, v?: Point) {
	az = az - Math.PI;
	if (!v) return new Point(Math.sin(az), -Math.cos(az));
	v.x = Math.sin(az);
	v.y = -Math.cos(az);
	return v;
};

// takes a source position and a target position and
// returns a number from 0.0 through PI * 2 that represents the angle
// between the two, or the "heading" from source to target
export const Azimuth = function (s_pos: Point, t_pos: Point) {
	return Math.atan2(t_pos.y - s_pos.y, t_pos.x - s_pos.x) + Math.PI / 2;
};

export const Clamp = (d: number, min: number, max: number) => {
	const t: number = d < min ? min : d;
	return t > max ? max : t;
};

export const ClampPoint = function (p: PointData, min: number, max: number, writeP?: PointData): PointData {
	if (writeP) {
		writeP.x = Clamp(p.x, min, max);
		writeP.y = Clamp(p.y, min, max);
		return writeP;
	} else {
		p.x = Clamp(p.x, min, max);
		p.y = Clamp(p.y, min, max);
		return p;
	}
};

// JH: Seems like magnitude and distance are sort of the same thing,
// but I not sure what youre doing here exactly
export const Magnitude = (x: number, y: number) => Math.sqrt(x * x + y * y);
export const Direction = (y: number, x: number) => Math.atan2(y, x);
export const Distance = (p1: Point, p2: Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

// JH: not sure what this is for?
export const LocationAround = (min: number, max: number): Point => {
	// get a random angle around the ring
	const rndAngle = NumberInRange(-360, 360) * DEG_TO_RAD; // use radians, saves converting degrees to radians

	// determine position
	const cX = Math.sin(rndAngle);
	const cZ = Math.cos(rndAngle);

	let ringPos = new Point(cX, cZ);
	ringPos.multiplyScalar(min, ringPos);

	let wallPos = new Point(cX, cZ);
	wallPos.multiplyScalar(max, wallPos);

	return ringPos.add(wallPos);
};

export const Roll = (amount: number): number => {
	return Math.round(NumberInRange(0, amount - 1));
}