import Entity from "./Entity";
import {Position} from "../types";
import Animal from "./Animal";
import simulationStore from "../stores/simulationStore";
import {getChild} from "../utils/helpers";


interface IEggProps {
    id: string
    position: Position
    hatchTimestamp: number,
    parents: {father: Animal, mother: Animal}
}
class Egg extends Entity {
    parents: {father: Animal, mother: Animal}
    hatchTimestamp: number
    constructor({position, id, parents, hatchTimestamp}: IEggProps) {
        super(position, id);
        this.parents = parents
        this.hatchTimestamp = hatchTimestamp
    }

    public hatch(){
        simulationStore.removeEgg(this.id)
        simulationStore.addAnimal(getChild(this.parents, this.id, this.position))
    }

}

export default Egg