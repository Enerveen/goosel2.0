import Entity from "./Entity";
import {Position} from "../types";
import {getRandomInRange} from "../utils/utils";

interface IPlantProps {
    id: string,
    position: Position,
    nutritionValue?: number
}

class Plant extends Entity {
    id: string
    nutritionValue: number

    constructor(props: IPlantProps) {
        const {id, position, nutritionValue = getRandomInRange(300, 800)} = props
        super(position);
        this.id = id
        this.nutritionValue = nutritionValue
    }
}

export default Plant