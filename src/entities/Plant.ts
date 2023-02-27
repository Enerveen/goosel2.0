import Entity from "./Entity";
import {plantKind, Position} from "../types";
import {getRandomInRange} from "../utils/utils";
import simulationStore from "../stores/simulationStore";
import {getRandomPosition} from "../utils/helpers";
import Animal from "./Animal";

interface IPlantProps {
    id?: string,
    position?: Position,
    nutritionValue?: number,
    kind?: plantKind
}

class Plant extends Entity {
    nutritionValue: number
    kind: plantKind

    constructor(props?: IPlantProps) {
        const {foodNutritionMin, foodNutritionMax, fieldSize: {width, height}} = simulationStore.getSimulationConstants
        const {
            id = `P${simulationStore.getId()}`,
            position = getRandomPosition(
                width,
                height
            ),
            nutritionValue = getRandomInRange(
                foodNutritionMin,
                foodNutritionMax
            ),
            kind = 'common'
        } = props || {}
        super(position, id);
        this.nutritionValue = nutritionValue
        this.kind = kind
    }

    public affect(animal: Animal) {
        const {addLogItem} = simulationStore
        const timestamp = simulationStore.getTimestamp
        switch (this.kind) {
            case "poisonous":
                animal.energy.current -=this.nutritionValue * 2
                break;
            case "lethal":
                animal.die()
                addLogItem({message:`${animal.name} died after consuming a poisonous food`, timestamp})
                break;
            case "lovely":
                animal.energy.breedingCD = 0
                break;
            case "speed":
                animal.stats.speed += 0.1
                break;
            case "gay":
                animal.genes.gay = !animal.genes.gay
                break;
            default: break;
        }
    }

}

export default Plant