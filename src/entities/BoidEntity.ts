import Entity from "./Entity";
import {Position, Vector2} from "../types";
import {findDistance, getRandomPosition} from "../utils/helpers";
import entity from "./Entity";


const length = function(v: Vector2) {
    return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
}


const normalized = function(v: Vector2) {
    const l = length(v);

    return {
        x: v.x / l,
        y: v.y / l
    }
}


export class BoidEntity extends Entity {
    direction: Vector2
    velocity: number
    senseRadius: number
    senseAngle: number
    midPoint: Vector2
    activeMidPoint: boolean

    constructor(position: Position={x: 0, y: 0}, direction: Vector2={x: 1, y: 0}, velocity: number=0, senseRadius: number=1, senseAngle: number=360) {
        super(position);

        this.direction = normalized(direction);
        this.velocity = velocity;
        this.senseRadius = senseRadius;
        this.senseAngle = senseAngle;

        this.midPoint = {x: 0, y: 0};
        this.activeMidPoint = false;
    }


    steerAwayFrom(entity: Entity, senseFactor: number=1.0, precalculatedDistance?: number) {
        const distance = precalculatedDistance || length({
            x: this.position.x - entity.position.x,
            y: this.position.y - entity.position.y
        });

        if (distance < senseFactor * this.senseRadius) {
            this.direction.x += 0.25 * (this.position.x - entity.position.x) / distance;
            this.direction.y += 0.25 * (this.position.y - entity.position.y) / distance;
        }
    }


    follow(entity: Entity, senseFactor: number=1.0) {
        const distance = length({
            x: this.position.x - entity.position.x,
            y: this.position.y - entity.position.y
        });

        if (distance < senseFactor * this.senseRadius) {
            this.direction.x += 0.25 * (entity.position.x - this.position.x) * distance / (senseFactor * this.senseRadius);
            this.direction.y += 0.25 * (entity.position.y - this.position.y) * distance / (senseFactor * this.senseRadius);
        }
    }


    private keepDirectionOf(entity: BoidEntity) {
        this.direction.x += 0.09 * entity.direction.x;
        this.direction.y += 0.09 * entity.direction.y;
    }


    private dodge(entity: Entity, precalculatedDistance?: number) {
        const distance = precalculatedDistance || length({ x: this.position.x - entity.position.x, y: this.position.y - entity.position.y });

        const normal = {
            x: (entity.position.x - this.position.x) / distance,
            y: (entity.position.y - this.position.y) / distance
        }
        const dot = this.direction.x * normal.x + this.direction.y * normal.y;

        if (dot > 0.8) {
            const tangent = normalized({
                x: this.direction.x - dot * normal.x,
                y: this.direction.y - dot * normal.y
            })

            // possible nan but who cares
            this.direction.x += 0.05 * tangent.x;
            this.direction.y += 0.05 * tangent.y;
        }
    }


    update(elapsedTime: number) {
        if (this.activeMidPoint) {
            const unit = normalized({x: this.midPoint.x - this.position.x, y: this.midPoint.y - this.position.y});
            this.direction.x += 0.6 * unit.x;
            this.direction.y += 0.6 * unit.y;
        }

        this.position.x += elapsedTime * this.velocity * this.direction.x;
        this.position.y += elapsedTime * this.velocity * this.direction.y;

        this.direction = normalized(this.direction);

        this.activeMidPoint = false;
    }


    calculateDirection(other: BoidEntity) {
        const distance = findDistance(this.position, other.position)

        if (distance > this.senseRadius) {
            return;
        }

        this.dodge(other, distance);
        this.steerAwayFrom(other, 1.0, distance);
        this.keepDirectionOf(other);

        if (!this.activeMidPoint) {
            this.activeMidPoint = true;

            this.midPoint = {
                x: (this.position.x + other.position.x) / 2,
                y: (this.position.y + other.position.y) / 2
            }

            this.midPoint = other.position;
        } else {
            this.midPoint = {
                x: (this.midPoint.x + other.position.x) / 2,
                y: (this.midPoint.y + other.position.y) / 2
            }
        }
    }
}


export class BoidsSystem {
    boids: BoidEntity[] = []

    constructor(count: number, fieldSize: {edgeX: number, edgeY: number}) {
        for (let i = 0; i < count; i++) {
            this.boids.push(new BoidEntity(getRandomPosition(fieldSize.edgeX, fieldSize.edgeY), {
                x: 2 * Math.random() - 1,
                y: 2 * Math.random() - 1
            }, 1 + 5 * Math.random(), 50));
        }
    }


    steerAwayFrom(entities: Entity[], senseFactor = 1.0) {
        this.boids.forEach(boid => {
            entities.forEach(entity => {
                boid.steerAwayFrom(entity, senseFactor);
            })
        })
    }


    follow(entities: Entity[], senseFactor = 1.0) {
        this.boids.forEach(boid => {
            entities.forEach(entity => {
                boid.follow(entity, senseFactor);
            })
        })
    }


    update(elapsedTime: number) {
        this.boids.forEach((entity, indexI) => {
            this.boids.forEach((other, indexJ) => {
                if (indexI === indexJ) {
                    return;
                }

                entity.calculateDirection(other);
            })
        })

        this.boids.forEach(entity => {
            entity.update(elapsedTime);
        })
    }
}