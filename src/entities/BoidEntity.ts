import Entity from "./Entity";
import {BoundingBox, Circle, Position, Vector2} from "../types";
import {findDistance} from "../utils/helpers";
import {Quadtree} from "../dataStructures/quadtree";


const length = function(v: Vector2) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}


const normalized = function(v: Vector2) {
    const l = length(v);

    return {
        x: v.x / l,
        y: v.y / l
    }
}


const dot = (v1: Vector2, v2: Vector2) => {
    return v1.x * v2.x + v1.y * v2.y;
}


export class BoidEntity extends Entity {
    readonly id: number = BoidsSystem.getUniqueBoidId()

    direction: Vector2
    newDirection: Vector2 = {x: 0, y: 0}
    velocity: number
    senseRadius: number
    senseAngle: number
    centerPoints: Position[] = []

    constructor(position: Position={x: 0, y: 0}, direction: Vector2={x: 1, y: 0}, velocity: number=0, senseRadius: number=1, senseAngle: number=270) {
        super(position);

        this.direction = normalized(direction);
        this.newDirection.x = this.direction.x;
        this.newDirection.y = this.direction.y;
        this.velocity = velocity;
        this.senseRadius = senseRadius;
        this.senseAngle = senseAngle;
    }


    hasVisionOf(entity: Entity, senseFactor: number=1.0, ignoreSenseAngle: boolean=false, precalculatedDistance?: number) {
        const distance = precalculatedDistance || length({
            x: this.position.x - entity.position.x,
            y: this.position.y - entity.position.y
        });

        return distance < senseFactor * this.senseRadius && (ignoreSenseAngle || Math.acos(dot(normalized(this.direction), normalized({x: entity.position.x - this.position.x, y: entity.position.y - this.position.y}))) * 180 / Math.PI < this.senseAngle / 2);
    }


    steerAwayFrom(entity: Entity, senseFactor: number=1.0, ignoreSenseAngle: boolean=false, ignoreDistance: boolean=false, precalculatedDistance?: number) {
        const distance = precalculatedDistance || length({
            x: this.position.x - entity.position.x,
            y: this.position.y - entity.position.y
        });

        if (ignoreDistance || this.hasVisionOf(entity, senseFactor, ignoreSenseAngle, distance)) {
            this.newDirection.x += 0.025 * (this.position.x - entity.position.x) / distance;
            this.newDirection.y += 0.025 * (this.position.y - entity.position.y) / distance;
        }
    }


    follow(entity: Entity, senseFactor: number=1.0, ignoreSenseAngle: boolean=false) {
        const distance = length({
            x: this.position.x - entity.position.x,
            y: this.position.y - entity.position.y
        });

        if (this.hasVisionOf(entity, senseFactor, ignoreSenseAngle, distance)) {
            this.newDirection.x += 0.25 * (entity.position.x - this.position.x) * distance / (senseFactor * this.senseRadius);
            this.newDirection.y += 0.25 * (entity.position.y - this.position.y) * distance / (senseFactor * this.senseRadius);
        }
    }


    private keepDirectionOf(entity: BoidEntity) {
        this.newDirection.x += 0.01 * entity.direction.x;
        this.newDirection.y += 0.01 * entity.direction.y;
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

            this.newDirection.x += 0.025 * tangent.x;
            this.newDirection.y += 0.025 * tangent.y;
        }
    }


    update(elapsedTime: number) {
        if (this.centerPoints.length) {
            const centerPoint = {x: 0, y: 0};

            this.centerPoints.forEach(point => {
                centerPoint.x += point.x;
                centerPoint.y += point.y;
            })

            centerPoint.x /= this.centerPoints.length;
            centerPoint.y /= this.centerPoints.length;

            const unit = normalized({x: centerPoint.x - this.position.x, y: centerPoint.y - this.position.y});
            this.newDirection.x += 0.2 * unit.x;
            this.newDirection.y += 0.2 * unit.y;
        }

        this.position.x += elapsedTime * this.velocity * (this.newDirection.x + 2 * Math.random() - 1);
        this.position.y += elapsedTime * this.velocity * (this.newDirection.y + 2 * Math.random() - 1);

        this.direction = normalized(this.newDirection);
        this.newDirection.x = this.direction.x;
        this.newDirection.y = this.direction.y;

        this.centerPoints = []
    }


    calculateDirection(other: BoidEntity) {
        const distance = findDistance(this.position, other.position)

        if (!this.hasVisionOf(other, 1.0, false, distance)) {
           return false;
        }

        this.dodge(other, distance);
        this.steerAwayFrom(other, 1.0, false, true, distance);
        this.keepDirectionOf(other);

        this.centerPoints.push(other.position);

        return true;
    }
}


export class BoidsSystem {
    private static uniqueBoidId: number = 0

    static getUniqueBoidId() {
        return this.uniqueBoidId++;
    }


    boids: BoidEntity[] = []

    constructor(count: number, fieldSize: {edgeX: number, edgeY: number}) {
        for (let i = 0; i < count; i++) {
            this.boids.push(new BoidEntity({x: Math.random() * fieldSize.edgeX, y: Math.random() * fieldSize.edgeY}, {
                x: 2 * Math.random() - 1,
                y: 2 * Math.random() - 1
            }, 1 + 5 * Math.random(), 50));
        }
    }


    steerAwayFrom(entities: Entity[], senseFactor = 1.0, ignoreSenseAngle: boolean=false) {
        this.boids.forEach(boid => {
            entities.forEach(entity => {
                boid.steerAwayFrom(entity, senseFactor, ignoreSenseAngle);
            })
        })
    }


    follow(entities: Entity[], senseFactor = 1.0, ignoreSenseAngle: boolean=false) {
        this.boids.forEach(boid => {
            entities.forEach(entity => {
                boid.follow(entity, senseFactor, ignoreSenseAngle);
            })
        })
    }


    update(elapsedTime: number, ctx: CanvasRenderingContext2D) {
        const quadtree = new Quadtree({x: -1000, y: -1000}, 6000);
        this.boids.forEach(boid => {
            quadtree.push(boid);
        })

        //quadtree.dbgDraw(ctx);

        this.boids.forEach((entity, indexI) => {
            // const obb = new BoundingBox(
            //     entity.position.x - entity.senseRadius,
            //     entity.position.x + entity.senseRadius,
            //     entity.position.y - entity.senseRadius,
            //     entity.position.y + entity.senseRadius
            // )
            const circle = new Circle(entity.position.x, entity.position.y, entity.senseRadius);
            const possibleBoids = quadtree.get(circle) as BoidEntity[];

            possibleBoids.forEach(other => {
                if (entity.id === other.id) {
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