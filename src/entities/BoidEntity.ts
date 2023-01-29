import Entity from "./Entity";
import {Position, Vector2} from "../types";
import {findDistance} from "../utils/helpers";


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


    update(elapsedTime: number) {
        if (this.activeMidPoint) {
            const unit = normalized({x: this.midPoint.x - this.position.x, y: this.midPoint.y - this.position.y});
            this.direction.x += 0.5 * unit.x;
            this.direction.y += 0.5 * unit.y;
        }

        const velocity = this.velocity * Math.min(length(this.direction), 1.0);

        this.direction = normalized(this.direction);

        this.position.x += elapsedTime * velocity * this.direction.x;
        this.position.y += elapsedTime * velocity * this.direction.y;

        //this.direction = normalized(this.direction);

        this.activeMidPoint = false;
    }


    calculateDirection(other: BoidEntity) {
        const distance = findDistance(this.position, other.position)

        if (distance > this.senseRadius) {
            return;
        }

        const normal = {
            x: (other.position.x - this.position.x) / distance,
            y: (other.position.y - this.position.y) / distance
        }
        const dot = this.direction.x * normal.x + this.direction.y * normal.y;

        if (dot > 0.8) {
            console.log('aaaaaa');
            const tangent = normalized({
                x: this.direction.x - dot * normal.x,
                y: this.direction.y - dot * normal.y
            })

            // possible nan but who cares
            this.direction.x += 0.05 * tangent.x;
            this.direction.y += 0.05 * tangent.y;
        }

        this.direction.x += 0.01 * (this.position.x - other.position.x) / distance;
        this.direction.y += 0.01 * (this.position.y - other.position.y) / distance;

        this.direction.x += 0.05 * other.direction.x;
        this.direction.y += 0.05 * other.direction.y;

        if (!this.activeMidPoint) {
            this.activeMidPoint = true;

            this.midPoint = {
                x: (this.position.x + other.position.x) / 2,
                y: (this.position.y + other.position.y) / 2
            }
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

    constructor() {

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


export const boidsSystem = new BoidsSystem();