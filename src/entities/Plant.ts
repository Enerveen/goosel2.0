import Entity from "./Entity";
import {Position} from "../types";
import {getRandomInRange} from "../utils/utils";
import simulationStore from "../stores/simulationStore";
import {getRandomPosition} from "../utils/helpers";

interface IPlantProps {
    id?: string,
    position?: Position,
    nutritionValue?: number
}

class Plant extends Entity {
    id: string
    nutritionValue: number

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
            )
        } = props || {}
        super(position);
        this.id = id
        this.nutritionValue = nutritionValue
    }
}

export default Plant