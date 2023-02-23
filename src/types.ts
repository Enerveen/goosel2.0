import Animal from "./entities/Animal";
import {plantsKinds} from "./constants/simulation";

export type Position = {
    x: number
    y: number
    z?: number
}


export class Circle {
    x: number
    y: number
    r: number

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
    }


    check(position: Position) {
        return (position.x - this.x) ** 2 + (position.y - this.y) ** 2 < this.r ** 2;
    }


    obbIntersectionImpl(obb: BoundingBox) {
        const halfWidth = (obb.right - obb.left) / 2;
        const halfHeight = (obb.bottom - obb.top) / 2;
        const center = {
            x: obb.left + halfWidth,
            y: obb.top + halfHeight
        }

        const circleVector = {
            x: Math.abs(center.x - this.x),
            y: Math.abs(center.y - this.y)
        }

        if (circleVector.x > halfWidth + this.r) {
            return false;
        }
        if (circleVector.y > halfHeight + this.r) {
            return false;
        }

        if (circleVector.x <= halfWidth) {
            return true;
        }
        if (circleVector.y <= halfHeight) {
            return true;
        }

        return (circleVector.x - halfWidth) ** 2 + (circleVector.y - halfHeight) ** 2 <= this.r ** 2;
    }
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


    intersects(obb: BoundingBox | Circle) {
        return obb.obbIntersectionImpl(this)
    }


    obbIntersectionImpl(obb: BoundingBox) {
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
    hatchingTime: number,
    immunity: number,
    curiosity: number
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
    mutationChance: number
    breedingMinAge: number,
    breedingMaxAge: number,
    breedingMaxProgress: number,
    animalMaxEnergy: number,
    foodSpawnChance: number,
    initialFoodCount: number,
    initialAnimalCount: number,
    foodNutritionMin: number,
    foodNutritionMax: number,
    fieldSize: FieldDimensions
}

export type LogItem = {
    message: string,
    timestamp: number
}

export type Genes = {
    gay: boolean,
    scavenger: boolean,
    predator: boolean
}

export type plantKind = typeof plantsKinds[number] | 'common'