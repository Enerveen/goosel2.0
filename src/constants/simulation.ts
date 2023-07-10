import {SimulationConstants} from "../types";

export const plantsKinds =
    ['lethal', 'poisonous', 'speed', 'lovely', 'gay'] as const

export const simulationValuesMultipliers = {
    foodSensitivity: 200,
    breedingCD: 1000,
    breedingSensitivity: 200,
    hatchingTime: 1000,
    immunity: 0.5,
    curiosity: 0.5
}

export const timeConstants = {
    yearLength: 1200,
    monthLength: 300,
    dayLength: 10,
}

export const appConstants = {
    fps: 60,
    fieldXPadding: 0,
    fieldYPadding: 0,
    version: '0.0.1'
}


export const defaultSimConstants:SimulationConstants = {
    mutationChance: 0.2,
    breedingMinAge: 5,
    breedingMaxAge: 15,
    foodNutritionMin: 300,
    foodNutritionMax: 800,
    breedingMaxProgress: 200,
    animalMaxEnergy: 1200,
    foodSpawnChance: 0.03,
    initialFoodCount: 200,
    initialAnimalCount: 24,
    fieldSize: {width: 3200, height: 1800}
}

export const simConstantsRanges = {
    breedingAge: {
        min: 0,
        max: 30
    },
    foodNutrition: {
        min: 100,
        max: 3600,
        step: 50
    },
    animalMaxEnergy: {
        min: 100,
        max: 4800,
        step: 100
    },
    breedingMaxProgress: {
        min: 20,
        max: 1200,
        step: 20,
        multiplier: 0.1
    },
    foodSpawnChance: {
        min: 0,
        max: 0.05,
        multiplier: 100,
        step: 0.01
    },
    mutationChance: {
        min: 0.02,
        max: 1,
        step: 0.02,
        multiplier: 100
    },
    initialAnimalCount: {
        min: 0,
        max: 100,
        step:2
    },
    initialFoodCount: {
        min: 0,
        max: 400,
        step: 2
    },
    fieldWidth: {
        min: 200,
        max: 4200,
        step: 100
    },
    fieldHeight: {
        min: 200,
        max: 2000,
        step: 100
    }

}