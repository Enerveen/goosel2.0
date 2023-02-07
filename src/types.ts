import Animal from "./entities/Animal";

export type Position = {
    x: number
    y: number
}


export class Vector2 {
    x: number = 0
    y: number = 0


    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }


    normalize() {
        const norm = this.norm();
        this.x /= norm;
        this.y /= norm;

        return this;
    }


    normalized() {
        return new Vector2(this.x, this.y).normalize();
    }


    clamp(magnitude: number) {
        const length = this.norm();

        this.normalize();
        this.x *= Math.min(length, magnitude);
        this.y *= Math.min(length, magnitude);

        return this;
    }


    clamped(magnitude: number) {
        return new Vector2(this.x, this.y).clamp(magnitude);
    }


    norm() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}


export type Color = {
    r: number,
    g: number,
    b: number,
    a: number
}


export class BoundingBox {
    left: number = 0
    right: number = 0
    top: number = 0
    bottom: number = 0


    constructor(left: number=0, right: number=0, top: number=0, bottom: number=0) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }


    check(position: Position) {
        return position.x >= this.left &&
            position.x <= this.right &&
            position.y >= this.top &&
            position.y <= this.bottom;
    }


    intersects(obb: BoundingBox) {
        return Math.max(this.right, obb.right) - Math.min(this.left, obb.left) <= this.right - this.left + obb.right - obb.left &&
            Math.max(this.bottom, obb.bottom) - Math.min(this.top, obb.top) <= this.bottom - this.top + obb.bottom - obb.top;
    }
}


export type FieldDimensions = {
    width: number,
    height: number
}

export interface Texture {
    image: HTMLImageElement,
    width: number,
    height: number
    offsetX: number
    offsetY: number
}

export interface TextureAtlas extends Texture {
    frameWidth: number
    frameHeight: number
}

export type Age = {
    current: number
    birthTimestamp: number
    deathTimestamp: number | undefined
}

export type Energy = {
    current: number,
    max: number,
    breedingCD: number
}

export type Stats = {
    speed: number
    foodSensitivity: number
    breedingSensitivity: number,
    breedingCD: number,
    hatchingTime: number
}

export type Activity = {
    activity: 'walking' | 'looking for food' | 'heading to food' | 'breeding',
    progress: number
    maxProgress: number
    partner?: Animal
}

export type gender = 'male' | 'female'

export type appPhase = 'NOT_STARTED' | 'STARTED' | 'FINISHED'

export type SimulationConstants = {
    breedingMinAge: number,
    breedingMaxAge: number,
    breedingMaxProgress: number,
    animalMaxEnergy: number,
    foodSpawnChanceK: number,
    initialFoodCount: number,
    initialAnimalCount: number,
    foodNutritionMin: number,
    foodNutritionMax: number
}

export type LogItem = {
    message: string,
    timestamp: number
}