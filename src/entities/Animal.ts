import Entity from "./Entity";
import {Activity, Age, BoundingBox, Energy, FieldDimensions, gender, Position, Stats, Vector2} from "../types";
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
import simulationStore from "../stores/simulationStore";
import {Quadtree} from "../dataStructures/quadtree";
import {Movable} from "./Movable";

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

class Animal extends Entity implements Movable {

    steerFactor: number = 0.02
    maxVelocity: number
    speed: Vector2 = new Vector2(0, 0)
    targetDirection: Vector2 = new Vector2(0, 0)


    id: string
    name: string
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
            parents = null
        } = props

        super(position);

        this.parents = parents
        this.age = age
        this.energy = energy
        this.gender = gender
        this.isAlive = isAlive
        this.stats = stats
        this.id = id
        this.name = name || generateAnimalName(gender)
        this.currentActivity = {activity: "walking", progress: 0, maxProgress: 0}
        this.lastMealCoordinates = null
        this.lastBreedingCoordinates = null

        simulationStore.addLogItem({
            message: `${this.name} arrived!`,
            timestamp: parents ?
                age.birthTimestamp - stats.hatchingTime * simulationValuesMultipliers.hatchingTime : age.birthTimestamp
        })

        this.maxVelocity = this.stats.speed;
    }


    update(elapsedTime: number) {
        this.targetDirection.normalize();

        const desiredDirection = new Vector2(
            this.targetDirection.x * this.maxVelocity,
            this.targetDirection.y * this.maxVelocity
        );
        const steeringDirection = new Vector2(
            (desiredDirection.x - this.speed.x) * this.steerFactor,
            (desiredDirection.y - this.speed.y) * this.steerFactor
        ).clamped(this.steerFactor);

        this.speed = new Vector2(
            (this.speed.x + steeringDirection.x * elapsedTime),
            (this.speed.y + steeringDirection.y * elapsedTime)
        ).clamped(this.maxVelocity);

        this.position.x += this.speed.x * elapsedTime;
        this.position.y += this.speed.y * elapsedTime;
    }


    setTargetDirection(direction: Vector2) {
        this.targetDirection = direction;
    }


    addRandomForce(strength: number=1) {
        this.addForce(new Vector2(2 * Math.random() - 1, 2 * Math.random() - 1), strength);
    }


    addForce(force: Vector2, strength: number=1) {
        this.targetDirection.x += strength * force.x;
        this.targetDirection.y += strength * force.y;
    }


    private moveTo(position: Position) {
        this.position = position
    }

    private headTo(targetPosition: Position, simulationSpeed: number) {
        this.setTargetDirection(new Vector2(
            targetPosition.x - this.position.x,
            targetPosition.y - this.position.y
        ))
        this.update(simulationSpeed);
    }

    private walk(edgeX: number, edgeY: number, simulationSpeed: number, breedingMinAge: number, breedingMaxAge: number) {
        this.addRandomForce(0.05 * simulationSpeed);

        if (checkBreedingPossibility(this, breedingMinAge, breedingMaxAge) && this.lastBreedingCoordinates) {
            const lastBreedingVector = new Vector2(this.lastBreedingCoordinates.x - this.position.x, this.lastBreedingCoordinates.y - this.position.y);
            const lastBreedingDistance = lastBreedingVector.norm();

            if (lastBreedingDistance) {
                this.addForce(new Vector2(lastBreedingVector.x / lastBreedingDistance, lastBreedingVector.y / lastBreedingDistance),
                    0.01 * (lastBreedingDistance / (this.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity)) ** 2);
            }
        } else if (this.lastMealCoordinates) {
            const lastMealVector = new Vector2(this.lastMealCoordinates.x - this.position.x, this.lastMealCoordinates.y - this.position.y);
            const lastMealDistance = lastMealVector.norm();

            if (lastMealDistance > 0) {
                this.addForce(new Vector2(lastMealVector.x / lastMealDistance, lastMealVector.y / lastMealDistance),
                    0.01 * (lastMealDistance / (this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity)) ** 2);
            }
        }

        this.update(simulationSpeed);
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
        breedingMaxProgress: number,
        getId: () => number
    ) {
        if (this.age.current >= 0) {
            const {width: fieldWidth, height: fieldHeight} = fieldDimensions
            if (this.energy.current <= 1 && this.isAlive) {
                this.energy.current = 0
                this.die(timestamp)
                simulationStore.addLogItem({
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
                    this.breed(this.currentActivity.partner, addAnimal, timestamp, simulationSpeed, breedingMaxProgress, getId)
                } else {
                    this.currentActivity = {
                        activity: "walking",
                        progress: 0,
                        maxProgress: 0
                    }
                }
                if (checkBreedingPossibility(this, breedingMinAge, breedingMaxAge)) {
                    const partner = this.lookForPairQT(animals, breedingMinAge, breedingMaxAge, fieldDimensions)
                    if (partner) {
                        this.reachBreedingPartner(partner, simulationSpeed, breedingMaxProgress)
                        return
                    }
                }
                if (this.energy.current < this.energy.max * 0.75 && this.currentActivity.activity === 'walking') {
                    const nearestFoodPiece = this.lookForFoodQT(plants, fieldDimensions)
                    if (nearestFoodPiece) {
                        this.reachFood(nearestFoodPiece, removePlant, simulationSpeed)
                    } else {
                        this.walk(fieldWidth, fieldHeight, simulationSpeed, breedingMinAge, breedingMaxAge)
                    }
                    return;
                }
                if (this.currentActivity.activity === 'walking') {
                    this.walk(fieldWidth, fieldHeight, simulationSpeed, breedingMinAge, breedingMaxAge)
                }
                this.applyAging(timestamp)
            }
        } else if (timestamp >= this.age.birthTimestamp) {
            this.age.current = 0
        }
    }

    private lookForFoodQT(plants: Plant[], fieldSize: FieldDimensions) {
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

    private lookForPairQT(animals: Animal[], breedingMinAge: number, breedingMaxAge: number, fieldSize: FieldDimensions) {
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
        return this.lookForPair(possiblePairs as Animal[], breedingMinAge, breedingMaxAge)
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
        if (this.age.current < 0) {
            return;
        }

        const isBirthday: boolean = Math.floor((timestamp - this.age.birthTimestamp) / timeConstants.yearLength) > this.age.current
        if (!isBirthday) {
            return;
        }

        this.age.current += 1
        if (this.age.current <= 15) {
            return;
        }

        const isDead = (Math.random() * this.age.current) > 15
        if (!isDead) {
            return;
        }

        this.die(timestamp)
        simulationStore.addLogItem({
            message: `${this.name} died from aging. RIP legend`,
            timestamp
        })
    }

    private reachFood(nearestFoodPiece: Plant, removePlant: (id: string) => void, simulationSpeed: number) {
        if (findDistance(nearestFoodPiece.position, this.position) < 3 * simulationSpeed * this.stats.speed) {
            this.position = {
                x: nearestFoodPiece.position.x,
                y: nearestFoodPiece.position.y
            }
            const energyAfterFood = this.energy.current + nearestFoodPiece.nutritionValue
            this.energy.current = Math.min(energyAfterFood, this.energy.max)
            this.lastMealCoordinates = {
                x: nearestFoodPiece.position.x,
                y: nearestFoodPiece.position.y
            }
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
        breedingMaxProgress: number,
        getId: () => number
    ) {
        const {progress, maxProgress} = this.currentActivity
        this.energy.current -= +((simulationSpeed * calculateEnergyLoss(this.stats)).toFixed(3));
        if (progress >= maxProgress) {
            const father = this.gender === 'male' ? this : partner
            const mother = this.gender === 'female' ? this : partner
            const child = getChild(
                timestamp,
                {father, mother},
                `A${getId()}`,
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