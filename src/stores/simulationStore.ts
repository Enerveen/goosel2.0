import Animal from "../entities/Animal";
import Plant from "../entities/Plant";
import {action, computed, makeObservable, observable} from "mobx";
import {FieldDimensions} from "../types";
import {timeConstants} from "../constants/simulation";

export class SimulationStore {
    animals: Animal[] = []
    plants: Plant[] = []
    activeEntity: Animal | null = null
    windowSize: FieldDimensions = {width:0, height: 0}
    timestamp: number = 0
    idCounter: number = 0
    simulationSpeed: number = 10
    currentYear: number = -1
    log: string[] = []

    constructor() {
        makeObservable(this, {
            simulationSpeed: observable,
            timestamp: observable,
            activeEntity: observable,
            animals: observable,
            plants: observable,
            idCounter: observable,
            windowSize: observable,
            log: observable,
            getAnimals: computed,
            getPlants: computed,
            getSimulationSpeed: computed,
            getActiveEntity: computed,
            getId: action,
            getTimestamp: computed,
            getCurrentYear: computed,
            getWindowSize: computed,
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
            setWindowSize: action
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

    get getWindowSize() {
        return this.windowSize
    }

    get getLog() {
        return this.log.slice(0, 5).reverse()
    }

    getId = () => {
        return this.idCounter++
    }

    addLogItem = (logItem:string) => {
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

    clearAnimalCorpses = () => {
        this.animals = this.getAnimals.filter(entity =>
            !(entity.age.deathTimestamp && this.getTimestamp - entity.age.deathTimestamp > timeConstants.yearLength / 2)
        )
    }
}

const simulationStore = new SimulationStore()

export default simulationStore

