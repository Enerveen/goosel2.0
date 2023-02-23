import Animal from "./entities/Animal";
import {plantsKinds} from "./constants/simulation";

export type Position = {
    x: number
    y: number
    z?: number
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