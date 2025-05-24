import {gender, Position, Stats} from "../types";
import Animal from "../entities/Animal";
import {coinFlip, getRandomInRange, rollNPercentChance} from "./utils";
import {generateAnimalFirstName} from "./nameGen";
import Plant from "../entities/Plant";
import simulationStore from "../stores/simulationStore";

export const findDistance = (pos1: Position, pos2: Position) =>
    Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2)

export const getRandomPosition = (edgeX: number, edgeY: number) => ({
    x: Math.random() * edgeX,
    y: Math.random() * edgeY
})

const calculateGender = () => {
    if (simulationStore.getSimulationConstants.isBalancedGenderDiff) {
        const stats = simulationStore.getStatistics.gender[simulationStore.getStatistics.gender.length - 1]
        return getRandomInRange(0, stats.male + stats.female) > stats.male ? 'male' : 'female'
    } else {
        return coinFlip() ? 'male' : 'female'
    }
}

export const getChild = (
    parents: { mother: Animal, father: Animal },
    id: string,
    position: Position,
    siblingsCount: number
) => {
    const timestamp = simulationStore.getTimestamp
    const {mutationChance, animalMaxEnergy, breedingMaxProgress} = simulationStore.getSimulationConstants
    const {mother, father} = parents
    const statsDelta = Math.random() * 0.3
    const baseStats = {
        speed: (mother.stats.speed + father.stats.speed) / 2,
        foodSensitivity: (mother.stats.foodSensitivity + father.stats.foodSensitivity) / 2,
        breedingSensitivity: (mother.stats.breedingSensitivity + father.stats.breedingSensitivity) / 2,
        breedingCD: (mother.stats.breedingCD + father.stats.breedingCD) / 2,
        hatchingTime: (mother.stats.hatchingTime + father.stats.hatchingTime) / 2,
        immunity: (mother.stats.immunity + father.stats.immunity) / 2,
        curiosity: (mother.stats.curiosity + father.stats.curiosity) / 2
    }
    const gender: gender = calculateGender()

    const stats = {
        speed: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.speed : coinFlip() ?
            baseStats.speed + statsDelta : baseStats.speed - statsDelta).toFixed(3))),
        foodSensitivity: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.foodSensitivity : coinFlip() ?
            baseStats.foodSensitivity + statsDelta : baseStats.foodSensitivity - statsDelta).toFixed(3))),
        breedingSensitivity: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.breedingSensitivity : coinFlip() ?
            baseStats.breedingSensitivity + statsDelta : baseStats.breedingSensitivity - statsDelta).toFixed(3))),
        breedingCD: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.breedingCD : coinFlip() ?
            baseStats.breedingCD + statsDelta : baseStats.breedingCD - statsDelta).toFixed(3))),
        hatchingTime: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.hatchingTime : coinFlip() ?
            baseStats.hatchingTime + statsDelta : baseStats.hatchingTime - statsDelta).toFixed(3))),
        immunity: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.immunity : coinFlip() ?
            baseStats.immunity + statsDelta : baseStats.immunity - statsDelta).toFixed(3))),
        curiosity: Math.max(0.1, +((!rollNPercentChance(mutationChance) ? baseStats.curiosity : coinFlip() ?
            baseStats.curiosity + statsDelta : baseStats.curiosity - statsDelta).toFixed(3)))
    }

    const genes = {
        gay: rollNPercentChance(mutationChance / 2),
        scavenger: rollNPercentChance(mutationChance / 2) ? !(mother.genes.scavenger || father.genes.scavenger) : (mother.genes.scavenger || father.genes.scavenger)
    }
    return new Animal({
        id,
        parents,
        gender,
        genes,
        name: `${generateAnimalFirstName(gender)} ${father.name.split(' ').slice(1).join(' ')}`,
        position: {...position},
        energy: {
            current: (calculateEnergyLoss(father.stats, father.genes.scavenger) + calculateEnergyLoss(mother.stats, mother.genes.scavenger)) * breedingMaxProgress / siblingsCount,
            max: animalMaxEnergy,
            breedingCD: 0
        },
        age: {
            current: 0,
            birthTimestamp: timestamp
        },
        stats
    })
}

export const calculateEnergyLoss = (stats: Stats, isScavenger: boolean) => {
    const {
        speed,
        foodSensitivity,
        breedingSensitivity,
        curiosity,
        immunity,
        hatchingTime,
        breedingCD
    } = stats
        return 1.2 * speed *
            1.2 * foodSensitivity * 1.2 *
            breedingSensitivity *
            curiosity * immunity * (isScavenger ? 1.5 : 1) * 0.8 * breedingCD * 0.8 * hatchingTime;
}

export const checkBreedingPossibility = (animal: Animal) => {
    const {breedingMinAge, breedingMaxAge} = simulationStore.getSimulationConstants
    return animal.energy.current > animal.energy.max / 2 &&
        animal.energy.breedingCD <= 0 &&
        animal.age.current >= breedingMinAge &&
        animal.age.current <= breedingMaxAge &&
        animal.currentActivity.activity === 'walking'
}

export const generateFood = (amount: number) => {
    const {fieldSize: {width, height}} = simulationStore.getSimulationConstants
    return new Array(amount).fill(null).map((_, index) =>
        new Plant({id: `P${index}init`, position: getRandomPosition(width, height)}))
}


export const generateAnimals = (amount: number, demo: boolean = false) => {
    const {fieldSize: {width, height}, animalMaxEnergy} = simulationStore.getSimulationConstants
    return new Array(amount).fill(null).map((_, index) =>
        new Animal({
            id: `A${index}init`,
            position: demo ? getRandomPosition(
                simulationStore.getWindowSize.width,
                simulationStore.getWindowSize.height
            ) : getRandomPosition(width, height),
            energy: {current: demo ? Infinity : animalMaxEnergy, max: animalMaxEnergy, breedingCD: 0},
            genes: {
                gay: false,
                scavenger: false
            }
        }))
}
