import Entity from "./Entity";
import {Activity, Age, BoundingBox, Energy, gender, Genes, Position, Stats} from "../types";
import {coinFlip, getRandomInRange, rollNPercentChance} from "../utils/utils";
import Plant from "./Plant";
import {generateAnimalName} from "../utils/nameGen";
import {
    calculateEnergyLoss,
    checkBreedingPossibility,
    findDistance
} from "../utils/helpers";
import {timeConstants, simulationValuesMultipliers} from "../constants/simulation";
import Quadtree from "../dataStructures/Quadtree";
import store from "../stores/simulationStore";
import {Movable} from "./Movable";
import Vector2 from "../dataStructures/Vector2";
import Egg from "./Egg";
import Corpse from "./Corpse";

interface IAnimalProps {
    id: string
    name?: string,
    position: Position,
    gender?: gender,
    age?: Age,
    energy: Energy,
    stats?: Stats,
    genes?: Genes
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

    name: string
    gender: gender
    stats: Stats
    genes: Genes
    age: Age
    energy: Energy
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
            age = {current: 0, birthTimestamp: 0},
            energy,
            name,
            stats = {
                foodSensitivity: 1,
                speed: 1,
                breedingCD: 1,
                hatchingTime: 1,
                breedingSensitivity: 1,
                curiosity: 1,
                immunity: 1
            },
            parents = null,
            genes = {gay: false, predator: false, scavenger: false}
        } = props

        super(position, id);

        this.parents = parents
        this.age = age
        this.energy = energy
        this.gender = gender
        this.stats = stats
        this.genes = genes
        this.name = name || generateAnimalName(gender)
        this.currentActivity = {activity: "walking", progress: 0, maxProgress: 0}
        this.lastMealCoordinates = null
        this.lastBreedingCoordinates = null

        store.addLogItem({
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


    addRandomForce(strength: number = 1) {
        this.addForce(new Vector2(2 * Math.random() - 1, 2 * Math.random() - 1), strength);
    }


    addForce(force: Vector2, strength: number = 1) {
        this.targetDirection.x += strength * force.x;
        this.targetDirection.y += strength * force.y;
    }

    private headTo(targetPosition: Position) {
        this.setTargetDirection(new Vector2(
            targetPosition.x - this.position.x,
            targetPosition.y - this.position.y
        ))
        this.checkMapBounds()
        this.update(store.getSimulationSpeed);
    }

    private walk(isDemo: boolean) {
        this.addRandomForce(0.05 * store.getSimulationSpeed);

        if (checkBreedingPossibility(this) && this.lastBreedingCoordinates && !rollNPercentChance(this.stats.curiosity * simulationValuesMultipliers.curiosity)) {
            const lastBreedingVector = new Vector2(this.lastBreedingCoordinates.x - this.position.x, this.lastBreedingCoordinates.y - this.position.y);
            const lastBreedingDistance = lastBreedingVector.norm();

            if (lastBreedingDistance) {
                this.addForce(new Vector2(lastBreedingVector.x / lastBreedingDistance, lastBreedingVector.y / lastBreedingDistance),
                    0.01 * (lastBreedingDistance / (this.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity)) ** 2);
            }
        } else if (this.lastMealCoordinates && !rollNPercentChance(this.stats.curiosity * simulationValuesMultipliers.curiosity)) {
            const lastMealVector = new Vector2(this.lastMealCoordinates.x - this.position.x, this.lastMealCoordinates.y - this.position.y);
            const lastMealDistance = lastMealVector.norm();

            if (lastMealDistance > 0) {
                this.addForce(new Vector2(lastMealVector.x / lastMealDistance, lastMealVector.y / lastMealDistance),
                    0.01 * (lastMealDistance / (this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity)) ** 2);
            }
        }

        this.checkMapBounds(isDemo)
        this.update(store.getSimulationSpeed);
    }


    private checkMapBounds(isDemo: boolean = false) {
        const {width, height} = isDemo ? store.getWindowSize : store.getSimulationConstants.fieldSize

        const offset = 50;
        const offsetLeft = Math.max(0, this.position.x);
        const offsetRight = Math.max(0, width - this.position.x);
        const offsetTop = Math.max(0, this.position.y);
        const offsetBottom = Math.max(0, height - this.position.y);

        if (offsetLeft <= offset) {
            const dot = Math.max(0.0, Vector2.dot(new Vector2(-1, 0).normalized(), this.speed))

            this.addForce(new Vector2(
                5.0 * this.maxVelocity * dot * (1.0 - Math.min(1.0, offsetLeft / offset) ** 4),
                0.0
            ))
        }
        if (offsetRight <= offset) {
            const dot = Math.max(0.0, Vector2.dot(new Vector2(1, 0).normalized(), this.speed))

            this.addForce(new Vector2(
                -5.0 * this.maxVelocity * dot * (1.0 - Math.min(1.0, offsetRight / offset) ** 4),
                0.0
            ))
        }
        if (offsetTop <= offset) {
            const dot = Math.max(0.0, Vector2.dot(new Vector2(0, -1).normalized(), this.speed))

            this.addForce(new Vector2(
                0,
                5.0 * this.maxVelocity * dot * (1.0 - Math.min(1.0, offsetTop / offset) ** 4)
            ))
        }
        if (offsetBottom <= offset) {
            const dot = Math.max(0.0, Vector2.dot(new Vector2(0, 1).normalized(), this.speed))

            this.addForce(new Vector2(
                0,
                -5.0 * this.maxVelocity * dot * (1.0 - Math.min(1.0, offsetBottom / offset) ** 4)
            ))
        }
    }

    public live(isDemo: boolean = false) {
        const timestamp = store.getTimestamp
        const simulationSpeed = store.getSimulationSpeed
        const {addLogItem} = store

        if (this.energy.current <= 1) {
            this.energy.current = 0
            this.die()
            addLogItem({
                message: `${this.name} died from malnutrition. That is so sad, can we hit ${this.age.current} like${this.age.current % 10 === 1 && this.age.current !== 11 ? '' : 's'}?`,
                timestamp
            })
            return;
        }

        this.energy.current -= simulationSpeed * calculateEnergyLoss(this.stats);
        if (this.energy.breedingCD > 0) {
            this.energy.breedingCD -= simulationSpeed
        }
        if (this.currentActivity.activity === 'breeding' && this.currentActivity.partner) {
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
                this.walk(isDemo)
            }
            return;
        }
        if (this.currentActivity.activity === 'walking') {
            this.walk(isDemo)
        }
        this.applyAging()
    }

    private lookForFoodQT() {
        const {fieldSize} = store.getSimulationConstants
        const quadtree = new Quadtree({x: 0, y: 0}, Math.max(fieldSize.width, fieldSize.height))
        const foodSenseRange = this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity
        const searchObb = new BoundingBox(
            this.position.x - foodSenseRange,
            this.position.x + foodSenseRange,
            this.position.y - foodSenseRange,
            this.position.y + foodSenseRange,
        )
        const plants = store.getPlants as Plant[]
        plants.forEach(plant => {
            quadtree.push(plant);
        })
        if (this.genes.scavenger) {
            const corpses = store.getCorpses as Corpse[]
            corpses.forEach(corpse => {
                quadtree.push(corpse);
            })
        }
        const possibleFood = quadtree.get(searchObb)
        return this.lookForFood(possibleFood as (Plant | Corpse)[])
    }

    private lookForFood(food: (Plant | Corpse)[]) {
        const nearestFoodPiece = food.reduce(
            (acc: Plant | Corpse | null, elem) => {
                if (!acc) {
                    return elem
                }
                if (findDistance(this.position, elem.position) < findDistance(this.position, acc.position)) {
                    return elem
                }
                return null

            }, null
        )
        if (nearestFoodPiece && findDistance(nearestFoodPiece.position, this.position) < this.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity) {
            return nearestFoodPiece
        }
        return null
    }

    private lookForPairQT() {
        const animals = store.getAnimals as Animal[]
        const {fieldSize} = store.getSimulationConstants
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
            (this.genes.gay ? animal.gender === this.gender && animal.genes.gay : animal.gender !== this.gender))
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
        const timestamp = store.getTimestamp;

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

        this.die()
        store.addLogItem({
            message: `${this.name} died from aging. RIP legend`,
            timestamp
        })
    }

    private reachFood(nearestFoodPiece: Plant | Corpse) {
        const simulationSpeed = store.getSimulationSpeed
        const {removePlant, removeCorpse} = store
        if (findDistance(nearestFoodPiece.position, this.position) > 3 * simulationSpeed * this.stats.speed) {
            this.headTo(nearestFoodPiece.position)
            return;
        }
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

        if (nearestFoodPiece instanceof Corpse) {
            removeCorpse(nearestFoodPiece.id)
            return
        }

        if (nearestFoodPiece.kind !== 'common' && !rollNPercentChance(this.stats.immunity * simulationValuesMultipliers.immunity)) {
            nearestFoodPiece.affect(this)
        }
        removePlant(nearestFoodPiece.id)
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

    public die() {
        const timestamp = store.getTimestamp
        const {removeAnimal, addCorpse} = store
        removeAnimal(this.id)
        addCorpse(new Corpse({
            id: this.id,
            nutritionValue: 100 + this.energy.current,
            position: {...this.position},
            deathTimestamp: timestamp,
            age: this.age.current
        }))
    }

    private breed(partner: Animal) {
        const simulationSpeed = store.getSimulationSpeed
        const timestamp = store.getTimestamp
        const {addEgg, getId} = store
        const {progress, maxProgress} = this.currentActivity
        this.energy.current -= +((simulationSpeed * calculateEnergyLoss(this.stats)).toFixed(3));
        if (progress >= maxProgress) {
            if (!this.genes.gay) {
                const father = this.gender === 'male' ? this : partner
                const mother = this.gender === 'female' ? this : partner
                const eggs = new Array(getRandomInRange(1, 4)).fill(null)
                    .map((elem, index) => {
                        return new Egg({
                            parents: {father, mother},
                            id: `A${getId()}`,
                            position: {x: this.position.x - 20 + index * 10, y: this.position.y - 20 * index % 2},
                            hatchTimestamp: timestamp + mother.stats.hatchingTime * simulationValuesMultipliers.hatchingTime
                        })
                    })
                addEgg(eggs)
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