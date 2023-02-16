import {SimulationConstants} from "../types";

export const simulationValuesMultipliers = {
    foodSensitivity: 200,
    breedingCD: 1000,
    breedingSensitivity: 200,
    hatchingTime: 1000
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
    foodSpawnChanceK: 3,
    initialFoodCount: 200,
    initialAnimalCount: 24,
    fieldSize: {width: 3200, height: 1800}
}