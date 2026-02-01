import { Point, type PointData, type ObservablePoint } from "pixi.js";

// TODO: make rectangles work with entity rotation - maybe pass in
// a rotation angle or somehow make the rectangle CollisionBody type include
// a rotation?  Dunno.

// Collision body type: null (no body), number (circular radius), or Point (rectangular size)
export type CollisionBody = null | number | Point;

// Interface for entities that can participate in collision detection
export interface CollidableEntity {
	body: CollisionBody;
	position: Point | ObservablePoint;
	scale: number | ObservablePoint;
}

// Helper to get scale value (handles both number and ObservablePoint)
function getScale(scale: number | ObservablePoint): number {
	return typeof scale === "number" ? scale : scale.x;
}

// Test for circle to circle collision
// Assumes both hit bodies are set and of the correct type
function collide_rad_rad(entity1: CollidableEntity, entity2: CollidableEntity): boolean {
	const scale1 = getScale(entity1.scale);
	const scale2 = getScale(entity2.scale);
	const combinedRadius = (entity1.body as number) * scale1 + (entity2.body as number) * scale2;
	const collisionRadiusSquared = combinedRadius * combinedRadius;
	const deltaX = Math.abs(entity2.position.x - entity1.position.x);
	const deltaY = Math.abs(entity2.position.y - entity1.position.y);
	const distanceSquared = deltaX * deltaX + deltaY * deltaY;
	return distanceSquared < collisionRadiusSquared;
}

// Test for rect to circle collision
// Assumes both hit bodies are set and of the correct type
// entity1 is rectangle, entity2 is circle
function collide_rect_rad(entity1: CollidableEntity, entity2: CollidableEntity): boolean {
	const scale1 = entity1.scale;
	const rectBody = entity1.body as Point;
	const scale1X = typeof scale1 === "number" ? scale1 : scale1.x;
	const scale1Y = typeof scale1 === "number" ? scale1 : scale1.y;
	const halfWidth = rectBody.x * scale1X * 0.5;
	const halfHeight = rectBody.y * scale1Y * 0.5;
	const circleRadius = (entity2.body as number) * getScale(entity2.scale);
	const rectX = entity1.position.x;
	const rectY = entity1.position.y;
	const circleX = entity2.position.x;
	const circleY = entity2.position.y;
	if (circleX + circleRadius < rectX - halfWidth) return false;
	if (circleX - circleRadius > rectX + halfWidth) return false;
	if (circleY + circleRadius < rectY - halfHeight) return false;
	if (circleY - circleRadius > rectY + halfHeight) return false;
	return true;
}

// Test for rect to rect collision
// Assumes both hit bodies are set and of the correct type
function collide_rect_rect(entity1: CollidableEntity, entity2: CollidableEntity): boolean {
	// scale up the hit rects
	const position1 = entity1.position;
	const position2 = entity2.position;
	const rectBody1 = entity1.body as Point;
	const rectBody2 = entity2.body as Point;
	const scale1 = entity1.scale;
	const scale2 = entity2.scale;
	const scale1X = typeof scale1 === "number" ? scale1 : scale1.x;
	const scale1Y = typeof scale1 === "number" ? scale1 : scale1.y;
	const scale2X = typeof scale2 === "number" ? scale2 : scale2.x;
	const scale2Y = typeof scale2 === "number" ? scale2 : scale2.y;
	const scaledSize1 = new Point(rectBody1.x * scale1X, rectBody1.y * scale1Y);
	const scaledSize2 = new Point(rectBody2.x * scale2X, rectBody2.y * scale2Y);

	let deltaX = Math.abs(position1.x - position2.x);
	let combinedHalfWidth = (scaledSize1.x + scaledSize2.x) * 0.5;
	if (deltaX > combinedHalfWidth) return false;

	let deltaY = Math.abs(position1.y - position2.y);
	let combinedHalfHeight = (scaledSize1.y + scaledSize2.y) * 0.5;
	if (deltaY > combinedHalfHeight) return false;

	return true;
}

// Test for a body collision between any 2 entities.
export function collideEntities(entity1: CollidableEntity, entity2: CollidableEntity): boolean {
	const body1 = entity1.body;
	const body2 = entity2.body;
	if (body1 === null || body1 === undefined || body2 === null || body2 === undefined) return false; // need two actual bodies to make a collision
	if (typeof body1 === "number") {
		if (typeof body2 === "number") {
			// ---> entity1.circle to entity2.circle
			if (collide_rad_rad(entity1, entity2)) {
				return true;
			}
		} else {
			// ---> entity1.circle to entity2.square
			if (collide_rect_rad(entity2, entity1)) {
				return true;
			}
		}
	} else {
		if (typeof body2 === "number") {
			// ---> entity1.square to entity2.circle
			if (collide_rect_rad(entity1, entity2)) {
				return true;
			}
		} else {
			// ---> entity1.square to entity2.square
			if (collide_rect_rect(entity1, entity2)) {
				return true;
			}
		}
	}
	return false;
}

// Test to see if a point is within an entity's body
let pointTestEntity: CollidableEntity | null = null;
export function collidePointEntity(point: PointData, targetEntity: CollidableEntity): boolean {
	let testEntity = pointTestEntity;
	if (!testEntity) {
		testEntity = pointTestEntity = {
			body: 1,
			position: new Point(0, 0),
			scale: 1,
		};
	}
	testEntity.position.x = point.x;
	testEntity.position.y = point.y;
	const isColliding = collideEntities(testEntity, targetEntity);
	return isColliding;
}
