import Animal from "../entities/Animal";
import Plant from "../entities/Plant";
import {action, computed, makeObservable, observable} from "mobx";
import generateStatistics from "../utils/generateStatistics";
import {BoundingBox, Circle, FieldDimensions, LogItem, Position, SimulationConstants} from "../types";
import {defaultSimConstants, timeConstants} from "../constants/simulation";
import {getRandomPosition} from "../utils/helpers";
import Quadtree from "../dataStructures/Quadtree";
import Entity from "../entities/Entity";



class GrassEntity extends Entity {
    idx: number

    constructor(position: Position, idx: number) {
        super(position);

        this.idx = idx;
    }
}


export class GrassSystem {
    positions: GrassEntity[] = []
    states: {
        age: number,
        timestamp: number
    }[] = []

    activeEntities: number[] = []

    quadTree: Quadtree


    constructor(count: number) {
        const width = simulationStore.getSimulationConstants.fieldSize.width;
        const height = simulationStore.getSimulationConstants.fieldSize.height;

        for (let i = 0; i < count; i++) {
            this.positions.push(new GrassEntity(getRandomPosition(0.5 * width, 0.5 * height), i));
            this.states.push({
                age: 0.0,
                timestamp: 0.0
            });
        }

        this.quadTree = new Quadtree({x: 0.0, y: 0.0}, Math.max(width, height));
        this.positions.forEach(entity => {
            this.quadTree.push(entity);
        })
    }


    update(entities: Entity[]) {
        entities.forEach(entity => {
            const obb = new BoundingBox(
                entity.position.x - 40.0,
                entity.position.x + 40.0,
                entity.position.y - 40.0,
                entity.position.y + 40.0
            )
            const circle = new Circle(entity.position.x, entity.position.y, 40.0);

            this.quadTree.get(circle).forEach(grassEntity => {
                this.states[(grassEntity as GrassEntity).idx].timestamp = simulationStore.getTimestamp;
            })
        })

        this.states.forEach(state => {
            state.age = (simulationStore.getTimestamp - state.timestamp) / 600.0;

            state.age = 1.0 - Math.min(1.0, state.age);
        })
    }
}



export class SimulationStore {
    animals: Animal[] = []
    plants: Plant[] = []
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
    log: {logs: LogItem[], hidden: boolean} = {logs:[{message: 'Simulation has started!', timestamp:0}], hidden: true}

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
        this.animals = this.getAnimals.filter(entity =>
            !(entity.age.deathTimestamp && this.getTimestamp - entity.age.deathTimestamp > timeConstants.yearLength / 2)
        )
    }
}

const simulationStore = new SimulationStore()

export default simulationStore

