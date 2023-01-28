import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {SimulationStore} from "../../stores/simulationStore";
import {getRandomInRange} from "../../utils/utils";
import Plant from "../../entities/Plant";
import {
    generateAnimals,
    generateFood,
    getRandomPosition,
    handleCanvasClick, handleCanvasMouseMove,
    handleCanvasMousePress, handleCanvasMouseRelease, handleCanvasMouseWheel
} from "../../utils/helpers";
import View from "../../utils/View";
import {appPhase} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {appConstants} from "../../constants/simulation";

import {Camera} from "../../core/Camera";

interface ISceneProps {
    store: SimulationStore,
    setAppPhase: (phase: appPhase) => void
}

const Scene = observer(({store, setAppPhase}: ISceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize(store)
    const fieldSize = useMemo(() => ({
        edgeX: canvasWidth - appConstants.fieldXPadding,
        edgeY: canvasHeight - appConstants.fieldYPadding,
    }), [canvasWidth, canvasHeight])

    const view = useMemo(() => new View(context), [context])
    const mainCamera = useMemo(() => new Camera({ x: canvasWidth / 2, y: canvasHeight / 2 }, {x: canvasWidth, y: canvasHeight}), [canvasWidth, canvasHeight]);

    const step = useCallback(() => {
        const timestamp = store.getTimestamp
        if (timestamp === 0) {
            console.log('Simulation has started with the following constants:',
                JSON.stringify(store.getSimulationConstants, null, 4))
            store.addAnimal(generateAnimals(store.getSimulationConstants.initialAnimalCount,
                {width: fieldSize.edgeX, height: fieldSize.edgeY}, store.getSimulationConstants.animalMaxEnergy))
            store.addPlant(generateFood(store.getSimulationConstants.initialFoodCount,
                {width: fieldSize.edgeX, height: fieldSize.edgeY}))
        }
        if(!store.getAnimals.length) {
            setAppPhase('FINISHED')
        } else {
            store.clearAnimalCorpses()
            store.gatherStatistics()

            if (!context) {
                return;
            }

            context.resetTransform();
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            const aspect = { x: canvasWidth / mainCamera.fov.x / mainCamera.scale.x, y: canvasHeight / mainCamera.fov.y / mainCamera.scale.y };
            context.translate(canvasWidth / 2 - mainCamera.position.x * aspect.x, canvasHeight / 2 - mainCamera.position.y * aspect.y);
            context.scale(aspect.x, aspect.y);

            context.textAlign = 'center';
            context.font = "bold 18px Comic Sans MS"
            view.drawBackground({width:canvasWidth, height:canvasHeight})
            if (!getRandomInRange(0, store.getSimulationConstants.foodSpawnChanceK / store.simulationSpeed)) {
                store.addPlant(new Plant({
                    id: `P${store.getId}`,
                    nutritionValue: getRandomInRange(
                        store.getSimulationConstants.foodNutritionMin,
                        store.getSimulationConstants.foodNutritionMax
                    ),
                    position: getRandomPosition(fieldSize.edgeX, fieldSize.edgeY)
                }))
            }
            store.getPlants.forEach(entity => {
                view.drawPlant(entity.position)
            })
            store.getAnimals.forEach(entity => {
                entity.live(
                    timestamp,
                    store.getPlants,
                    store.getAnimals,
                    store.removePlant,
                    store.addAnimal,
                    {
                        width: fieldSize.edgeX,
                        height: fieldSize.edgeY
                    },
                    store.simulationSpeed,
                    store.getSimulationConstants.breedingMinAge,
                    store.getSimulationConstants.breedingMaxAge,
                    store.getSimulationConstants.breedingMaxProgress
                )
                view.drawAnimal(entity.position,
                    timestamp - entity.age.birthTimestamp,
                    {
                        gender: entity.gender,
                        age: entity.age.current,
                        isAlive: entity.isAlive,
                        name: entity.name
                    }
                )
                if (entity.currentActivity.activity === 'breeding') {
                    view.drawBreeding({x: entity.position.x + 30, y: entity.position.y - 60})
                }
                if (entity.id === store.getActiveEntity?.id) {
                    store.setActiveEntity(entity)
                }
            })
        }
    }, [context, canvasWidth, canvasHeight]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            setContext(ctx);
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        if (context) {
            const render = () => {
                step();
                store.updateTimestamp()
                animationFrameId = window.requestAnimationFrame(render);
            };
            render();
        }
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [context, step, store]);

    return <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={event => handleCanvasMousePress(event, mainCamera)}
        onMouseUp={event => handleCanvasMouseRelease(event, mainCamera)}
        onMouseMove={event => handleCanvasMouseMove(event, mainCamera)}
        onWheel={event => handleCanvasMouseWheel(event, mainCamera)}
        onClick={event => handleCanvasClick(
            event,
            view,
            store.getAnimals,
            store.setActiveEntity,
            store.removeActiveEntity)}/>;
})

export default Scene