import {Position} from "../types";


class RegisterEntity<T> {
    registeredType: T | null = null;
}


class Entity {
    position: Position
    id: string

    constructor(position: Position, id: string) {
        this.position = position
        this.id = id
    }

}

export default Entity