import Entity from "./Entity";
import {Position} from "../types";

interface ICorpseProps {
    position: Position,
    id: string,
    nutritionValue: number,
    deathTimestamp: number,
    age: number
}

class Corpse extends Entity {

    nutritionValue: number
    deathTimestamp: number
    age: number
    constructor({position, id, nutritionValue, deathTimestamp, age}: ICorpseProps) {
        super(position, id);
        this.nutritionValue = nutritionValue
        this.deathTimestamp = deathTimestamp
        this.age = age
    }
}

export default Corpse