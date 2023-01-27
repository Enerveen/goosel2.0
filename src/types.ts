import Animal from "./entities/Animal";

export type Position = {
    x: number
    y: number
}


export type Vector2 = {
    x: number,
    y: number
}

export type FieldDimensions = {
    width: number,
    height: number
}

export interface Texture {
    image: HTMLImageElement,
    width: number,
    height: number
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