import Entity from "../entities/Entity";
import {BoundingBox, Circle, Position} from "../types";
import Quadtree from "../dataStructures/Quadtree";
import {getRandomPosition} from "../utils/helpers";
import simulationStore from "../stores/simulationStore";
import Vector2 from "../dataStructures/Vector2";


class GrassEntity extends Entity {
    idx: number

    constructor(position: Position, idx: number) {
        super(position);

        this.idx = idx;
    }
}


export class GrassSystem {
    // TODO: optimize with active entities and precreated SRV

    readonly  positions: GrassEntity[] = []
    readonly  states: {
        age: number,
        timestamp: number
    }[] = []

    activeEntities: number[] = []

    readonly quadTree: Quadtree


    constructor(count: number) {
        const width = simulationStore.getSimulationConstants.fieldSize.width;
        const height = simulationStore.getSimulationConstants.fieldSize.height;

        const MAX_SPORTS = 10;
        const DENSITY = 0.008;

        const mapOBB = new BoundingBox(0, width, 0, height);

        const spotsCount = Math.floor((MAX_SPORTS + 1) * Math.random());
        let generated = 0;
        let clamped = 0;
        for (let i = 0; i < spotsCount; i++) {
            const spawnRate = 1.0 / (spotsCount - i);
            const spawnCount = Math.floor(spawnRate * (count - generated - (spotsCount - 1)));

            const spotPosition = getRandomPosition(width, height);
            const spotRadius = Math.sqrt(spawnCount / (DENSITY * 3.141592));

            for (let j = 0; j < spawnCount; j++) {
                const phi = 2.0 * Math.PI * Math.random();
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);
                const radiusCoeff = Math.max(Math.random(), Math.random());

                const position = new Vector2(
                    radiusCoeff * spotRadius * cosPhi + spotPosition.x,
                    radiusCoeff * spotRadius * sinPhi + spotPosition.y
                )

                if (!mapOBB.check(position)) {
                    generated--;
                    continue;
                }

                this.positions.push(new GrassEntity(position, generated + j - clamped));
                this.states.push({
                    age: 0.0,
                    timestamp: 0.0
                });
            }

            generated += spawnCount - clamped;
            clamped = 0;
        }

        this.quadTree = new Quadtree({x: 0.0, y: 0.0}, Math.max(width, height));
        this.positions.forEach(entity => {
            this.quadTree.push(entity);
        })
    }


    update(entities: Entity[]) {
        entities.forEach(entity => {
            const circle = new Circle(entity.position.x, entity.position.y, 30.0);

            this.quadTree.get(circle).forEach(grassEntity => {
                this.states[(grassEntity as GrassEntity).idx].timestamp = simulationStore.getTimestamp;
            })
        })

        this.states.forEach(state => {
            state.age = (simulationStore.getTimestamp - state.timestamp) / 200.0;

            state.age = 1.0 - Math.min(1.0, state.age);
        })
    }
}