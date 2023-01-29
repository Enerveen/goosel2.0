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

    constructor(position: Position={x: 0, y: 0}, direction: Vector2={x: 1, y: 0}, velocity: number=0, senseRadius: number=1, senseAngle: number=360) {
        super(position);

        this.direction = direction;
        this.velocity = velocity;
        this.senseRadius = senseRadius;
        this.senseAngle = senseAngle;
    }


    update() {
        this.position.x += this.direction.x;
        this.direction.y += this.direction.y;
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

        if (dot > 0.7) {
            const tangent = normalized({
                x: this.direction.x - dot * normal.x,
                y: this.direction.y - dot * normal.y
            })

            // possible nan but who cares
            this.direction.x += tangent.x / distance;
            this.direction.y += tangent.y / distance;
        }
    }
}


export class BoidsSystem {
    boids: BoidEntity[] = []

    constructor() {

    }


    update() {
        this.boids.forEach((entity, indexI) => {
            this.boids.forEach((other, indexJ) => {
                if (indexI === indexJ) {
                    return;
                }

                entity.calculateDirection(other);
            })
        })

        this.boids.forEach(entity => {
            entity.update();
        })
    }
}


export const boidsSystem = new BoidsSystem();