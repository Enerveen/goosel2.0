import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
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
import Renderer from "../../graphics/Renderer";
import {appPhase} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {appConstants, timeConstants} from "../../constants/simulation";

import {Camera} from "../../graphics/Camera";
import ImageContext from "../../stores/ImageContext";
import useStatisticsStore from "../../stores/statisticsStore";
import generateStatistics from "../../utils/generateStatistics";
import useSimConstantsStore from "../../stores/simConstantsStore";

interface ISceneProps {
    store: SimulationStore,
    setAppPhase: (phase: appPhase) => void
}

const Scene = observer(({store, setAppPhase}: ISceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize(store)
    const updateStatistics = useStatisticsStore(state => state.updateStatistics)
    const simConstants = useSimConstantsStore(state => state.constants)
    const fieldSize = useMemo(() => ({
        edgeX: canvasWidth - appConstants.fieldXPadding,
        edgeY: canvasHeight - appConstants.fieldYPadding,
    }), [canvasWidth, canvasHeight])
    const images = useContext(ImageContext)
    const renderer = useMemo(() => new Renderer(context, images), [context])
    const mainCamera = useMemo(() => new Camera({ x: fieldSize.edgeX / 2, y: fieldSize.edgeY / 2 }, {x: canvasWidth, y: canvasHeight}), [fieldSize, canvasWidth, canvasHeight]);

    const step = useCallback(() => {
        const timestamp = store.getTimestamp
        if (timestamp === 0) {
            console.log('Simulation has started with the following constants:',
                JSON.stringify(simConstants, null, 4))
            store.addAnimal(generateAnimals(simConstants.initialAnimalCount,
                {width: fieldSize.edgeX, height: fieldSize.edgeY}, simConstants.animalMaxEnergy))
            store.addPlant(generateFood(simConstants.initialFoodCount,
                {width: fieldSize.edgeX, height: fieldSize.edgeY}))
        }
        if(!store.getAnimals.length) {
            setAppPhase('FINISHED')
        } else {
            store.clearAnimalCorpses()
            if (Math.round(store.timestamp / timeConstants.yearLength) > store.currentYear) {
                store.currentYear += 1
                updateStatistics(generateStatistics(store.animals, store.plants), store.currentYear)
            }

            if (!context) {
                return;
            }

            context.resetTransform();
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            mainCamera.checkBounds({left: 0, top: 0, right: fieldSize.edgeX, bottom: fieldSize.edgeY});
            {
                const scale = Math.min(canvasWidth / mainCamera.fov.x, canvasHeight / mainCamera.fov.y);
                context.translate(canvasWidth / 2 - mainCamera.position.x * scale, canvasHeight / 2 - mainCamera.position.y * scale);
                context.scale(scale, scale);
            }

            context.textAlign = 'center';
            context.font = "bold 18px Comic Sans MS"
            renderer.drawSeamlessBackground({width: fieldSize.edgeX, height:fieldSize.edgeY})
            if (!getRandomInRange(0, simConstants.foodSpawnChanceK / store.simulationSpeed)) {
                store.addPlant(new Plant({
                    id: `P${store.getId()}`,
                    nutritionValue: getRandomInRange(
                        simConstants.foodNutritionMin,
                        simConstants.foodNutritionMax
                    ),
                    position: getRandomPosition(fieldSize.edgeX, fieldSize.edgeY)
                }))
            }
            store.getPlants.forEach(entity => {
                renderer.drawPlant(entity.position)
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
                    simConstants.breedingMinAge,
                    simConstants.breedingMaxAge,
                    simConstants.breedingMaxProgress,
                    store.getId
                )
                renderer.drawAnimal(entity.position,
                    timestamp - entity.age.birthTimestamp,
                    {
                        gender: entity.gender,
                        age: entity.age.current,
                        isAlive: entity.isAlive,
                        name: entity.name
                    }
                )
                if (entity.currentActivity.activity === 'breeding') {
                    renderer.drawBreeding({x: entity.position.x + 30, y: entity.position.y - 60})
                }
                if (entity.id === store.getActiveEntity?.id) {
                    store.setActiveEntity(entity)
                }
            })

            renderer.drawClouds(timestamp);
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
            renderer,
            store.getAnimals,
            store.setActiveEntity,
            store.removeActiveEntity)}/>;
})

export default Scene;