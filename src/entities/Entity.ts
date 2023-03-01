import {Position} from "../types";

class Entity {
    position: Position
    id: string

    constructor(position: Position, id: string) {
        this.position = position
        this.id = id
    }

}

export default Entity