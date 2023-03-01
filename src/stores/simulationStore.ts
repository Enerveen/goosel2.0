import Animal from "../entities/Animal";
import Plant from "../entities/Plant";
import {action, computed, makeObservable, observable} from "mobx";
import generateStatistics from "../utils/generateStatistics";
import {BoundingBox, Circle, FieldDimensions, LogItem, Position, SimulationConstants} from "../types";
import {defaultSimConstants, timeConstants} from "../constants/simulation";
import Egg from "../entities/Egg";
import Corpse from "../entities/Corpse";



export class SimulationStore {
    animals: Animal[] = []
    plants: Plant[] = []
    eggs: Egg[] = []
    corpses: Corpse[] = []
    activeEntity: Animal | null = null
    windowSize: FieldDimensions = {width:0, height: 0}
    timestamp: number = 0
    idCounter: number = 0
    simulationSpeed: number = 2
    currentYear: number = -1
    statistics: {
        age: { child: number, teen: number, mature: number, elder: number, year: number }[],
        genes: {total: number, predator: number, gay:  number, scavenger: number, year: number}[]
        gender: { male: number, female: number, year: number }[]
        averageStats: {
            breedingCD: number,
            breedingSensitivity: number,
            hatchingTime: number,
            foodSensitivity: number,
            speed: number,
            curiosity: number,
            immunity: number,
            year: number
        }[]
        populationChange: {value: number, year: number}[]
        plantStats: {year: number, count: number, totalNutrition: number}[]
        animalCount: number[]
    } = {age: [], gender: [], averageStats: [], populationChange:[], animalCount: [], plantStats: [], genes: []}
    simulationConstants: SimulationConstants = defaultSimConstants
    log: {logs: LogItem[], hidden: boolean} = {logs:[{message: 'Simulation has started!', timestamp:0}], hidden: false}

    constructor() {
        makeObservable(this, {
            simulationSpeed: observable,
            timestamp: observable,
            activeEntity: observable,
            animals: observable,
            plants: observable,
            eggs: observable,
            corpses: observable,
            idCounter: observable,
            statistics: observable,
            windowSize: observable,
            simulationConstants: observable,
            log: observable,
            getAnimals: computed,
            getPlants: computed,
            getEggs: computed,
            getCorpses: computed,
            getSimulationSpeed: computed,
            getActiveEntity: computed,
            getActiveEntityEnergy: computed,
            getId: action,
            getTimestamp: computed,
            getCurrentYear: computed,
            getStatistics: computed,
            getWindowSize: computed,
            getSimulationConstants: computed,
            getLog: computed,
            getLogHidden: computed,
            toggleLogHidden: action,
            addLogItem: action,
            addAnimal: action,
            removeAnimal: action,
            addPlant: action,
            removePlant: action,
            addEgg: action,
            removeEgg: action,
            addCorpse: action,
            removeCorpse: action,
            setActiveEntity: action,
            removeActiveEntity: action,
            updateTimestamp: action,
            setSimulationSpeed: action,
            clearAnimalCorpses: action,
            gatherStatistics: action,
            setWindowSize: action,
            setSimulationConstants: action,
            reset: action
        })
    }

    get getAnimals() {
        return this.animals
    }

    get getPlants() {
        return this.plants
    }

    get getEggs() {
        return this.eggs
    }
    get getCorpses() {
        return this.corpses
    }

    get getActiveEntity() {
        return this.activeEntity
    }

    get getActiveEntityEnergy() {
        return this.activeEntity?.energy.current
    }

    get getTimestamp() {
        return this.timestamp
    }

    get getSimulationSpeed() {
        return this.simulationSpeed
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
        return this.log.logs.slice(0, 10)
    }

    get getLogHidden() {
        return this.log.hidden
    }

    getId = () => {
        return this.idCounter++
    }

    addLogItem = (logItem:LogItem) => {
        this.log.logs.unshift(logItem)
    }

    toggleLogHidden = () => {
        this.log.hidden = !this.log.hidden
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

    addEgg = (egg: Egg | Egg[]) => {
        if (Array.isArray(egg)) {
            this.eggs.unshift(...egg)
        } else {
            this.eggs.unshift(egg)
        }

    }

    removeEgg = (idToRemove: string) => {
        this.eggs = this.eggs.filter(egg => egg.id !== idToRemove)
    }

    addCorpse = (corpse: Corpse | Corpse[]) => {
        if (Array.isArray(corpse)) {
            this.corpses.unshift(...corpse)
        } else {
            this.corpses.unshift(corpse)
        }

    }

    removeCorpse = (idToRemove: string) => {
        this.corpses = this.corpses.filter(corpse => corpse.id !== idToRemove)
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
            const {gender, age, averageStats, animalsCount, plantsStats, genes} = generateStatistics(this.animals, this.plants)
            const populationChange = animalsCount - (this.statistics.animalCount.at(-1) || 0)
            this.statistics = {
                age: [...this.statistics.age, {year: this.currentYear, ...age}],
                gender: [...this.statistics.gender, {year: this.currentYear, ...gender}],
                averageStats: [...this.statistics.averageStats, {year: this.currentYear, ...averageStats}],
                populationChange: [...this.statistics.populationChange, {year: this.currentYear, value: populationChange}],
                animalCount: [...this.statistics.animalCount, animalsCount],
                plantStats: [...this.statistics.plantStats, {year: this.currentYear, ...plantsStats}],
                genes: [...this.statistics.genes, {year: this.currentYear, total: animalsCount, ...genes}]
            }
        }
    }

    clearAnimalCorpses = () => {
        this.corpses = this.getCorpses.filter(entity =>
            this.getTimestamp - entity.deathTimestamp < timeConstants.yearLength * 3)
    }

    reset = () => {
        this.animals = []
        this.plants = []
        this.corpses = []
        this.eggs = []
        this.timestamp = 0
        this.activeEntity = null
        this.idCounter = 0
        this.simulationSpeed = 2
        this.currentYear = -1
        this.simulationConstants = defaultSimConstants
        this.statistics = {age: [], gender: [], averageStats: [], populationChange:[], animalCount: [], plantStats: [], genes: []}
        this.log = {logs:[{message: 'Simulation has started!', timestamp:0}], hidden: false}
    }
}

const simulationStore = new SimulationStore()

export default simulationStore

