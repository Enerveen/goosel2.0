import Entity from "./Entity";
import {Activity, Age, Energy, FieldDimensions, gender, Position, Stats} from "../types";
import {coinFlip, getRandomInRange} from "../utils/utils";
import Plant from "./Plant";
import {generateAnimalName} from "../utils/nameGen";
import {
    calculateEnergyLoss,
    checkBreedingPossibility,
    findDistance,
    getChild,
    getRandomPosition
} from "../utils/helpers";
import {timeConstants, simulationValuesMultipliers} from "../constants/simulation";

interface IAnimalProps {
    id: string
    name?: string,
    position: Position,
    gender?: gender,
    age?: Age,
    energy: Energy
    isAlive?: boolean,
    stats?: Stats,
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
    age: Age
    energy: Energy
    isAlive: boolean
    currentActivity: Activity
    parents: {
        mother: Animal,
        father: Animal
    } | null

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
            parents = null
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
        this.id = id
        this.name = name || generateAnimalName(gender)
        this.currentActivity = {activity: "walking", progress: 0, maxProgress: 0}

        console.log(`${this.name} arrived!`)
    }

    private moveTo(position: Position) {
        this.position = position
    }

    private headTo(targetPosition: Position, simulationSpeed: number) {
        const distance = findDistance(this.position, targetPosition)
        const deltaX = this.position.x + (targetPosition.x - this.position.x) * this.stats.speed * simulationSpeed / distance;
        const deltaY = this.position.y + (targetPosition.y - this.position.y) * this.stats.speed * simulationSpeed / distance;
        this.moveTo({x: deltaX, y: deltaY})
    }

    private walk(edgeX: number, edgeY: number, simulationSpeed: number) {
        if (this.isOnWalkTarget) {
            this.walkDestination = getRandomPosition(edgeX, edgeY)
            this.isOnWalkTarget = false;
        }
        this.headTo(this.walkDestination, simulationSpeed);
        if (findDistance(this.position, this.walkDestination) < 3 * simulationSpeed * this.stats.speed) {
            this.isOnWalkTarget = true;
        }
    }

    public live(
        timestamp: number,
        plants: Plant[],
        animals: Animal[],
        removePlant: (idToRemove: string) => void,
        addAnimal: (animal: Animal) => void,
        fieldDimensions: FieldDimensions,
        simulationSpeed: number,
        breedingMinAge: number,
        breedingMaxAge: number,
        breedingMaxProgress: number
    ) {
        if (this.age.current >= 0) {
            const {width: fieldWidth, height: fieldHeight} = fieldDimensions
            if (this.energy.current <= 1 && this.isAlive) {
                this.energy.current = 0
                this.die(timestamp)
                console.log(`${this.name} died from malnutrition. That is so sad, can we hit ${this.age.current} likes?`) // cringe
            }
            if (this.isAlive) {
                this.energy.current -= simulationSpeed * calculateEnergyLoss(this.stats);
                if (this.energy.breedingCD > 0) {
                    this.energy.breedingCD -= simulationSpeed
                }
                if (this.currentActivity.activity === 'breeding' && this.currentActivity.partner?.isAlive) {
                    this.breed(this.currentActivity.partner, addAnimal, timestamp, simulationSpeed, breedingMaxProgress)
                } else {
                    this.currentActivity = {
                        activity: "walking",
                        progress: 0,
                        maxProgress: 0
                    }
                }
                if (checkBreedingPossibility(this, breedingMinAge, breedingMaxAge)) {
                    const partner = this.lookForPair(animals, breedingMinAge, breedingMaxAge)
                    if (partner) {
                        this.reachBreedingPartner(partner, simulationSpeed, breedingMaxProgress)
                        return
                    }
                }
                if (this.energy.current < this.energy.max * 0.75 && this.currentActivity.activity === 'walking') {
                    const nearestFoodPiece = this.lookForFood(plants)
                    if (nearestFoodPiece) {
                        this.reachFood(nearestFoodPiece, removePlant, simulationSpeed)
                    } else {
                        this.walk(fieldWidth, fieldHeight, simulationSpeed)
                    }
                    return;
                }
                if (this.currentActivity.activity === 'walking') {
                    this.walk(fieldWidth, fieldHeight, simulationSpeed)
                }
                this.applyAging(timestamp)
            }
        } else if (timestamp >= this.age.birthTimestamp) {
            this.age.current = 0
        }
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

    private lookForPair(animals: Animal[], breedingMinAge: number, breedingMaxAge: number) {
        const nearestPair = [...animals].filter(animal =>
            animal.id !== this.id &&
            checkBreedingPossibility(animal, breedingMinAge, breedingMaxAge) &&
            animal.gender !== this.gender &&
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

    private applyAging(timestamp: number) {
        if (this.age.current >= 0) {
            const isBirthday: boolean = Math.floor((timestamp - this.age.birthTimestamp) / timeConstants.yearLength) > this.age.current
            if (isBirthday) {
                this.age.current += 1
                if (this.age.current > 15) {
                    const isDead = (Math.random() * this.age.current) > 15
                    if (isDead) {
                        this.die(timestamp)
                        console.log(`${this.name} died from aging. RIP legend`)
                    }
                }
            }
        }
    }

    private reachFood(nearestFoodPiece: Plant, removePlant: (id: string) => void, simulationSpeed: number) {
        if (findDistance(nearestFoodPiece.position, this.position) < 3 * simulationSpeed * this.stats.speed) {
            this.position = nearestFoodPiece.position
            const energyAfterFood = this.energy.current + nearestFoodPiece.nutritionValue
            this.energy.current = Math.min(energyAfterFood, this.energy.max)
            removePlant(nearestFoodPiece.id)
        } else {
            this.headTo(nearestFoodPiece.position, simulationSpeed)
        }
    }

    private reachBreedingPartner(partner: Animal, simulationSpeed: number, breedingMaxProgress: number) {
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
            this.headTo(partner.position, simulationSpeed)
        }
    }

    private die(timestamp: number) {
        this.isAlive = false
        this.age.deathTimestamp = timestamp
    }

    private breed(
        partner: Animal,
        addAnimal: (animal: Animal) => void,
        timestamp: number,
        simulationSpeed: number,
        breedingMaxProgress: number
    ) {
        const {progress, maxProgress} = this.currentActivity
        this.energy.current -= +((simulationSpeed * calculateEnergyLoss(this.stats)).toFixed(3));
        if (progress >= maxProgress) {
            const father = this.gender === 'male' ? this : partner
            const mother = this.gender === 'female' ? this : partner
            const child = getChild(
                timestamp,
                {father, mother},
                `A${getRandomInRange(0, 10000)}`,
                breedingMaxProgress,
                this.energy.max
            )
            addAnimal(child)
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