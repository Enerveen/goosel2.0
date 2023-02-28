import {Position} from "../types";


class Entity {
    private static uniqueId: number = 0;

    position: Position
    id: string

    constructor(position: Position, id: string) {
        this.position = position
        this.id = id;
    }


    getType() {
        return null;
    }


    private static getUniqueId() {
        return this.uniqueId++;
    }
}

export default Entity