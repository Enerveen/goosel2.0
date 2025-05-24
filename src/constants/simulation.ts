import {SimulationConstants} from "../types";

export const plantsKinds =
    ['tasty', 'hearty','speed', 'lovely', 'gay', 'lethal', 'poisonous'] as const

export const simulationValuesMultipliers = {
    foodSensitivity: 200,
    breedingCD: 900,
    breedingSensitivity: 200,
    hatchingTime: 900,
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
    breedingMinAge: 3,
    breedingMaxAge: 18,
    foodNutritionMin: 800,
    foodNutritionMax: 1600,
    breedingMaxProgress: 800,
    animalMaxEnergy: 2400,
    foodSpawnChance: 0.01,
    initialFoodCount: 200,
    initialAnimalCount: 24,
    fieldSize: {width: 1800, height: 1000},
    isBalancedGenderDiff: true
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