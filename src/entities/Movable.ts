import {Position, Vector2} from "../types";

export interface Movable {
    steerFactor: number
    maxVelocity: number
    speed: Vector2
    targetDirection: Vector2

    update(elapsedTime: number) : void;
    setTargetDirection(direction: Vector2) : void;
    addRandomForce(strength: number) : void;
    addForce(force: Vector2, strength: number) : void;
}