import Animal from "./entities/Animal";
import {plantsKinds} from "./constants/simulation";
import {ReactNode} from "react";

export type Position = {
    x: number
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

export type Tab = {
    content: ReactNode | ReactNode[],
    id: string,
    label: string
}