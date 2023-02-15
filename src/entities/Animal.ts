import Entity from "./Entity";
import {Activity, Age, BoundingBox, Energy, gender, Genes, Position, Stats} from "../types";
import {coinFlip} from "../utils/utils";
import Plant from "./Plant";
import {generateAnimalName} from "../utils/nameGen";
import {
    calculateEnergyLoss,
    checkBreedingPossibility,
    findDistance,
    getChild,
    getRandomPosition, getRandomPositionInRect
} from "../utils/helpers";
import {timeConstants, simulationValuesMultipliers} from "../constants/simulation";
import {Quadtree} from "../dataStructures/quadtree";
import store from "../stores/simulationStore";

interface IAnimalProps {
    id: string
    name?: string,
    position: Position,
    gender?: gender,
    age?: Age,
    energy: Energy
    isAlive?: boolean,
    stats?: Stats,
    genes?: Genes
    parents?: {
        mother: Animal,
        father: Animal
    } | null
}

class Animal extends Entity {
    id: string
    name: string
    walkDestination: Position
    isOnWalkTarget: boolean
    gender: gender
    stats: Stats
    genes: Genes
    age: Age
    energy: Energy
    isAlive: boolean
    currentActivity: Activity
    parents: {
        mother: Animal,
        father: Animal
    } | null
    lastMealCoordinates: Position | null
    lastBreedingCoordinates: Position | null

    constructor(props: IAnimalProps) {
        const {
            id,
            position,
            gender = coinFlip() ? 'male' : 'female',
            age = {current: 0, birthTimestamp: 0, deathTimestamp: undefined},
            energy,
            isAlive = true,
            name,
            stats = {foodSensitivity: 1, speed: 1, breedingCD: 1, hatchingTime: 1, breedingSensitivity: 1},
            parents = null,
            genes = {gay: false, predator: false, scavenger: false}
        } = props

        super(position);

        this.parents = parents
        this.age = age
        this.energy = energy
        this.isOnWalkTarget = false
        this.walkDestination = {x: position.x + 10, y: position.y + 10}
        this.gender = gender
        this.isAlive = isAlive
        this.stats = stats
        this.genes = genes
        this.id = id
        this.name = name || generateAnimalName(gender)
        this.currentActivity = {activity: "walking", progress: 0, maxProgress: 0}
        this.lastMealCoordinates = null
        this.lastBreedingCoordinates = null

        store.addLogItem({
            message: `${this.name} arrived!`,
            timestamp: parents ?
                age.birthTimestamp - stats.hatchingTime * simulationValuesMultipliers.hatchingTime : age.birthTimestamp
        })
    }

    private moveTo(position: Position) {
        this.position = position
    }

    private headTo(targetPosition: Position) {
        const simulationSpeed = store.getSimulationSpeed
        const distance = findDistance(this.position, targetPosition)
        const deltaX = this.position.x + (targetPosition.x - this.position.x) * this.stats.speed * simulationSpeed / distance;
        const deltaY = this.position.y + (targetPosition.y - this.position.y) * this.stats.speed * simulationSpeed / distance;
        this.moveTo({x: deltaX, y: deltaY})
    }

    private walk(demo: boolean) {
        const fieldSize = demo ? store.getWindowSize : store.getSimulationConstants.fieldSize
        const simulationSpeed = store.getSimulationSpeed
        if (this.isOnWalkTarget) {
            this.isOnWalkTarget = false;
            if (checkBreedingPossibility(this) && this.lastBreedingCoordinates) {
                this.walkDestination = getRandomPositionInRect(
                    this.lastBreedingCoordinates,
                    this.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity * 2,
                    fieldSize
                )
                return
            }
            if (this.lastMealCoordinates) {
                this.walkDestination = getRandomPositionInRect(
                    this.lastMealCoordinates,
                    this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity * 2,
                    fieldSize
                )
                return;
            }
            this.walkDestination = getRandomPosition(fieldSize.width, fieldSize.height)
        }
        this.headTo(this.walkDestination);
        if (findDistance(this.position, this.walkDestination) < 3 * simulationSpeed * this.stats.speed) {
            this.isOnWalkTarget = true;
        }
    }

    public live(demo: boolean = false) {
        const timestamp = store.getTimestamp
        const simulationSpeed = store.getSimulationSpeed
        const {addLogItem} = store

        if (this.age.current >= 0) {
            if (this.energy.current <= 1 && this.isAlive) {
                this.energy.current = 0
                this.die(timestamp)
                addLogItem({
                    message: `${this.name} died from malnutrition. That is so sad, can we hit ${this.age.current} like${this.age.current % 10 === 1 && this.age.current !== 11 ? '' : 's'}?`,
                    timestamp
                })
            }
            if (this.isAlive) {
                this.energy.current -= simulationSpeed * calculateEnergyLoss(this.stats);
                if (this.energy.breedingCD > 0) {
                    this.energy.breedingCD -= simulationSpeed
                }
                if (this.currentActivity.activity === 'breeding' && this.currentActivity.partner?.isAlive) {
                    this.breed(this.currentActivity.partner)
                } else {
                    this.currentActivity = {
                        activity: "walking",
                        progress: 0,
                        maxProgress: 0
                    }
                }
                if (checkBreedingPossibility(this)) {
                    const partner = this.lookForPairQT()
                    if (partner) {
                        this.reachBreedingPartner(partner)
                        return
                    }
                }
                if (this.energy.current < this.energy.max * 0.75 && this.currentActivity.activity === 'walking') {
                    const nearestFoodPiece = this.lookForFoodQT()
                    if (nearestFoodPiece) {
                        this.reachFood(nearestFoodPiece)
                    } else {
                        this.walk(demo)
                    }
                    return;
                }
                if (this.currentActivity.activity === 'walking') {
                    this.walk(demo)
                }
                this.applyAging()
            }
        } else if (timestamp >= this.age.birthTimestamp) {
            this.age.current = 0
        }
    }

    private lookForFoodQT() {
        const plants = store.getPlants as Plant[]
        const {fieldSize} = store.getSimulationConstants
        const quadtree = new Quadtree({x: 0, y: 0}, Math.max(fieldSize.width, fieldSize.height))
        const foodSenseRange = this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity
        const searchObb = new BoundingBox(
            this.position.x - foodSenseRange,
            this.position.x + foodSenseRange,
            this.position.y - foodSenseRange,
            this.position.y + foodSenseRange,
        )
        plants.forEach(plant => {
            quadtree.push(plant);
        })
        const possiblePlants = quadtree.get(searchObb)
        return this.lookForFood(possiblePlants as Plant[])
    }

    private lookForFood(plants: Plant[]) {
        const nearestFoodPiece = [...plants].sort((a, b) => {
            const distanceToA = findDistance(this.position, a.position)
            const distanceToB = findDistance(this.position, b.position)
            if (distanceToA > distanceToB) {
                return 1
            }
            if (distanceToB > distanceToA) {
                return -1
            }
            return 0
        })[0]
        if (nearestFoodPiece && findDistance(nearestFoodPiece.position, this.position) < this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity) {
            return nearestFoodPiece
        }
        return null
    }

    private lookForPairQT() {
        const animals = store.getAnimals as Animal[]
        const { fieldSize } = store.getSimulationConstants
        const quadtree = new Quadtree({x: 0, y: 0}, Math.max(fieldSize.width, fieldSize.height))
        const breedingSenseRange = this.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity
        const searchObb = new BoundingBox(
            this.position.x - breedingSenseRange,
            this.position.x + breedingSenseRange,
            this.position.y - breedingSenseRange,
            this.position.y + breedingSenseRange,
        )
        animals.forEach(animal => {
            quadtree.push(animal);
        })
        const possiblePairs = quadtree.get(searchObb)
        return this.lookForPair(possiblePairs as Animal[])
    }

    private lookForPair(animals: Animal[]) {
        const nearestPair = [...animals].filter(animal =>
            animal.id !== this.id &&
            checkBreedingPossibility(animal) &&
            (this.genes.gay ? animal.gender === this.gender && animal.genes.gay : animal.gender !== this.gender) &&
            animal.isAlive)
            .sort((a, b) => {
                const distanceToA = findDistance(this.position, a.position)
                const distanceToB = findDistance(this.position, b.position)
                if (distanceToA > distanceToB) {
                    return 1
                }
                if (distanceToB > distanceToA) {
                    return -1
                }
                return 0
            })[0]
        if (nearestPair && findDistance(nearestPair.position, this.position) < this.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity) {
            return nearestPair
        }
        return null
    }

    private applyAging() {
        const timestamp = store.getTimestamp
        if (this.age.current >= 0) {
            const isBirthday: boolean = Math.floor((timestamp - this.age.birthTimestamp) / timeConstants.yearLength) > this.age.current
            if (isBirthday) {
                this.age.current += 1
                if (this.age.current > 15) {
                    const isDead = (Math.random() * this.age.current) > 15
                    if (isDead) {
                        this.die(timestamp)
                        store.addLogItem({
                            message: `${this.name} died from aging. RIP legend`,
                            timestamp
                        })
                    }
                }
            }
        }
    }

    private reachFood(nearestFoodPiece: Plant) {
        const simulationSpeed = store.getSimulationSpeed
        const {removePlant} = store
        if (findDistance(nearestFoodPiece.position, this.position) < 3 * simulationSpeed * this.stats.speed) {
            this.position = nearestFoodPiece.position
            const energyAfterFood = this.energy.current + nearestFoodPiece.nutritionValue
            this.energy.current = Math.min(energyAfterFood, this.energy.max)
            this.lastMealCoordinates = nearestFoodPiece.position
            removePlant(nearestFoodPiece.id)
        } else {
            this.headTo(nearestFoodPiece.position)
        }
    }

    private reachBreedingPartner(partner: Animal) {
        const simulationSpeed = store.getSimulationSpeed
        const {breedingMaxProgress} = store.getSimulationConstants
        if (findDistance(partner.position, this.position) < 3 * simulationSpeed * this.stats.speed) {
            this.currentActivity = {
                activity: "breeding",
                progress: 0,
                maxProgress: breedingMaxProgress,
                partner: partner
            }
            partner.currentActivity = {
                activity: "breeding",
                progress: 0,
                maxProgress: breedingMaxProgress,
                partner: this
            }
        } else {
            this.headTo({x: partner.position.x, y: partner.position.y})
        }
    }

    private die(timestamp: number) {
        this.isAlive = false
        this.age.deathTimestamp = timestamp
    }

    private breed(partner: Animal) {
        const simulationSpeed = store.getSimulationSpeed
        const {addAnimal} = store
        const {progress, maxProgress} = this.currentActivity
        this.energy.current -= +((simulationSpeed * calculateEnergyLoss(this.stats)).toFixed(3));
        if (progress >= maxProgress) {
            if (!this.genes.gay) {
                const father = this.gender === 'male' ? this : partner
                const mother = this.gender === 'female' ? this : partner
                const child = getChild({father, mother})
                addAnimal(child)
            }
            this.currentActivity = {
                activity: 'walking',
                progress: 0,
                maxProgress: 0
            }
            partner.currentActivity = {
                activity: 'walking',
                progress: 0,
                maxProgress: 0
            }
            this.energy = {
                ...this.energy,
                breedingCD: this.stats.breedingCD * simulationValuesMultipliers.breedingCD
            }
            partner.energy = {
                ...partner.energy,
                breedingCD: partner.stats.breedingCD * simulationValuesMultipliers.breedingCD
            }
        } else {
            this.currentActivity.progress += simulationSpeed
        }
        return
    }


}

export default Animal