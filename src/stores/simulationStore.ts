import Animal from "../entities/Animal";
import Plant from "../entities/Plant";
import {action, computed, makeObservable, observable} from "mobx";
import generateStatistics from "../utils/generateStatistics";
import {FieldDimensions, LogItem, SimulationConstants} from "../types";
import {defaultSimConstants, timeConstants} from "../constants/simulation";

export class SimulationStore {
    animals: Animal[] = []
    plants: Plant[] = []
    activeEntity: Animal | null = null
    windowSize: FieldDimensions = {width:0, height: 0}
    timestamp: number = 0
    idCounter: number = 0
    simulationSpeed: number = 10
    currentYear: number = -1
    statistics: {
        age: { child: number, teen: number, mature: number, elder: number, year: number }[],
        gender: { male: number, female: number, year: number }[]
        averageStats: {
            breedingCD: number,
            breedingSensitivity: number,
            hatchingTime: number,
            foodSensitivity: number,
            speed: number,
            year: number
        }[]
        populationChange: {value: number, year: number}[]
        plantStats: {year: number, count: number, totalNutrition: number}[]
        animalCount: number[]
    } = {age: [], gender: [], averageStats: [], populationChange:[], animalCount: [], plantStats: []}
    simulationConstants: SimulationConstants = defaultSimConstants
    log: LogItem[] = [{message: 'Simulation has started!', timestamp:0}]

    constructor() {
        makeObservable(this, {
            simulationSpeed: observable,
            timestamp: observable,
            activeEntity: observable,
            animals: observable,
            plants: observable,
            idCounter: observable,
            statistics: observable,
            windowSize: observable,
            simulationConstants: observable,
            log: observable,
            getAnimals: computed,
            getPlants: computed,
            getSimulationSpeed: computed,
            getActiveEntity: computed,
            getId: action,
            getTimestamp: computed,
            getCurrentYear: computed,
            getStatistics: computed,
            getWindowSize: computed,
            getSimulationConstants: computed,
            getLog: computed,
            addLogItem: action,
            addAnimal: action,
            removeAnimal: action,
            addPlant: action,
            removePlant: action,
            setActiveEntity: action,
            removeActiveEntity: action,
            updateTimestamp: action,
            setSimulationSpeed: action,
            clearAnimalCorpses: action,
            gatherStatistics: action,
            setWindowSize: action,
            setSimulationConstants: action
        })
    }

    get getAnimals() {
        return this.animals
    }

    get getPlants() {
        return this.plants
    }

    get getActiveEntity() {
        return this.activeEntity
    }

    get getTimestamp() {
        return this.timestamp
    }

    get getSimulationSpeed() {
        return this.timestamp
    }

    get getCurrentYear() {
        return this.currentYear
    }

    get getStatistics() {
        return this.statistics
    }

    get getWindowSize() {
        return this.windowSize
    }

    get getSimulationConstants () {
        return this.simulationConstants
    }

    get getLog() {
        return this.log.slice(0, 10)
    }

    getId = () => {
        return this.idCounter++
    }

    addLogItem = (logItem:LogItem) => {
        this.log.unshift(logItem)
    }

    addAnimal = (animal: Animal | Animal[]) => {
        if (Array.isArray(animal)) {
            this.animals.unshift(...animal)
        } else {
            this.animals.unshift(animal)
        }

    }

    removeAnimal = (idToRemove: string) => {
        this.animals = this.animals.filter(animal => animal.id !== idToRemove)
    }

    addPlant = (plant: Plant | Plant[]) => {
        if (Array.isArray(plant)) {
            this.plants.push(...plant)
        } else {
            this.plants.push(plant)
        }
    }

    removePlant = (idToRemove: string) => {
        this.plants = this.plants.filter(plant => plant.id !== idToRemove)
    }

    setActiveEntity = (entity: Animal) => {
        this.activeEntity = null
        this.activeEntity = entity
    }

    removeActiveEntity = () => {
        this.activeEntity = null
    }

    updateTimestamp = () => {
        this.timestamp = this.timestamp + this.simulationSpeed
    }

    setSimulationSpeed = (speed: number) => {
        this.simulationSpeed = speed
    }

    setWindowSize = (windowSize: {width: number, height: number}) => {
        this.windowSize = windowSize
    }

    setSimulationConstants = (constants: SimulationConstants) => {
        this.simulationConstants = constants
    }

    gatherStatistics = () => {
        if (Math.round(this.timestamp / timeConstants.yearLength) > this.currentYear || this.timestamp === 0) {
            this.currentYear += 1
            const {gender, age, averageStats, animalsCount, plantsStats} = generateStatistics(this.animals, this.plants)
            const populationChange = animalsCount - (this.statistics.animalCount.at(-1) || 0)
            this.statistics = {
                age: [...this.statistics.age, {year: this.currentYear, ...age}],
                gender: [...this.statistics.gender, {year: this.currentYear, ...gender}],
                averageStats: [...this.statistics.averageStats, {year: this.currentYear, ...averageStats}],
                populationChange: [...this.statistics.populationChange, {year: this.currentYear, value: populationChange}],
                animalCount: [...this.statistics.animalCount, animalsCount],
                plantStats: [...this.statistics.plantStats, {year: this.currentYear, ...plantsStats}],
            }
        }
    }

    clearAnimalCorpses = () => {
        this.animals = this.getAnimals.filter(entity =>
            !(entity.age.deathTimestamp && this.getTimestamp - entity.age.deathTimestamp > timeConstants.yearLength / 2)
        )
    }
}

const simulationStore = new SimulationStore()

export default simulationStore

