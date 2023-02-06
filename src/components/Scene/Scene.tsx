import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import classes from './Scene.module.scss'
import {observer} from "mobx-react-lite";
import {SimulationStore} from "../../stores/simulationStore";
import {getRandomInRange} from "../../utils/utils";
import Plant from "../../entities/Plant";
import {
    generateAnimals,
    generateFood,
    getRandomPosition
} from "../../utils/helpers";
import Renderer from "../../graphics/Renderer";
import {appPhase, BoundingBox} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {Camera} from "../../graphics/Camera";
import ImageContext from "../../stores/ImageContext";
import {
    handleCanvasClick, handleCanvasMouseMove,
    handleCanvasMousePress, handleCanvasMouseRelease, handleCanvasMouseWheel, handleCanvasTouchEnd,
    handleCanvasTouchMove,
    handleCanvasTouchStart
} from "../../utils/eventHandlers";

interface ISceneProps {
    store: SimulationStore,
    setAppPhase: (phase: appPhase) => void
}

const Scene = observer(({store, setAppPhase}: ISceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const touchRef = useRef({start: 0, end: 0})
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize(store)
    const images = useContext(ImageContext)
    const renderer = useMemo(() => new Renderer(context, images), [context])
    const mainCamera = useMemo(() => new Camera(
        {x: store.getSimulationConstants.fieldSize.width / 2,
            y: store.getSimulationConstants.fieldSize.height / 2
        }, {
        x: store.getSimulationConstants.fieldSize.width,
        y: store.getSimulationConstants.fieldSize.height
    }), [
        store.getSimulationConstants.fieldSize.width,
        store.getSimulationConstants.fieldSize.height,
        canvasWidth,
        canvasHeight
    ]);

    const init = useCallback(() => {
        console.log('Simulation has started with the following constants:',
            JSON.stringify(store.getSimulationConstants, null, 4))
        store.addAnimal(generateAnimals(store.getSimulationConstants.initialAnimalCount,
            {
                width: store.getSimulationConstants.fieldSize.width,
                height: store.getSimulationConstants.fieldSize.height
            }, store.getSimulationConstants.animalMaxEnergy))
        store.addPlant(generateFood(store.getSimulationConstants.initialFoodCount,
            {
                width: store.getSimulationConstants.fieldSize.width,
                height: store.getSimulationConstants.fieldSize.height
            }))
    }, [canvasWidth, canvasHeight])


    const calculateStep = useCallback((timestamp: number) => {
        if (timestamp === 0) {
            init()
        }
        if (!store.getAnimals.length) {
            setAppPhase('FINISHED')
            return
        }
        store.clearAnimalCorpses()
        store.gatherStatistics()
        if (!getRandomInRange(0, store.getSimulationConstants.foodSpawnChanceK / store.getSimulationSpeed)) {
            store.addPlant(new Plant({
                id: `P${store.getId()}`,
                nutritionValue: getRandomInRange(
                    store.getSimulationConstants.foodNutritionMin,
                    store.getSimulationConstants.foodNutritionMax
                ),
                position: getRandomPosition(
                    store.getSimulationConstants.fieldSize.width,
                    store.getSimulationConstants.fieldSize.height
                )
            }))
        }
        store.getAnimals.forEach(animal => animal.live(
            timestamp,
            store.getPlants,
            store.getAnimals,
            store.removePlant,
            store.addAnimal,
            {
                width: store.getSimulationConstants.fieldSize.width,
                height: store.getSimulationConstants.fieldSize.height
            },
            store.getSimulationSpeed,
            store.getSimulationConstants.breedingMinAge,
            store.getSimulationConstants.breedingMaxAge,
            store.getSimulationConstants.breedingMaxProgress,
            store.getId
        ))
    }, [context, canvasWidth, canvasHeight])


    const drawStep = useCallback((timestamp: number) => {

        if (!context) {
            return;
        }

        context.resetTransform();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        mainCamera.checkBounds(new BoundingBox(0, store.getSimulationConstants.fieldSize.width,
            0, store.getSimulationConstants.fieldSize.height));
        {
            const scale = Math.min(canvasWidth / mainCamera.fov.x, canvasHeight / mainCamera.fov.y);
            context.translate(canvasWidth / 2 - mainCamera.position.x * scale, canvasHeight / 2 - mainCamera.position.y * scale);
            context.scale(scale, scale);
        }

        renderer.drawSeamlessBackground({
            width: store.getSimulationConstants.fieldSize.width,
            height: store.getSimulationConstants.fieldSize.height})
        store.getPlants.forEach(entity => {
            renderer.drawPlant(entity.position)
        })
        store.getAnimals.forEach(entity => {
            renderer.drawAnimal(entity.position,
                timestamp - entity.age.birthTimestamp,
                {
                    gender: entity.gender,
                    age: entity.age.current,
                    isAlive: entity.isAlive,
                    name: entity.name,
                    currentActivity: entity.currentActivity.activity
                }
            )
            renderer.drawLabels(entity.position,
                {
                    gender: entity.gender,
                    age: entity.age.current,
                    isAlive: entity.isAlive,
                    name: entity.name,
                    currentActivity: entity.currentActivity.activity
                }
            )
            if (entity.id === store.getActiveEntity?.id) {
                store.setActiveEntity(entity)
            }
        })

        if (!store.getLogHidden) {
            renderer.drawLogs(timestamp, store.getLog)
        }
        renderer.drawClouds(timestamp, store.getSimulationConstants.fieldSize);
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
                const timestamp = store.getTimestamp
                calculateStep(timestamp);
                drawStep(timestamp);
                store.updateTimestamp()
                animationFrameId = window.requestAnimationFrame(render);
            };
            render();
        }
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [context, drawStep, store]);

    return <canvas
        className={classes.canvas}
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={event => handleCanvasMousePress(event, mainCamera)}
        onMouseUp={handleCanvasMouseRelease}
        onMouseMove={event => handleCanvasMouseMove(event, mainCamera)}
        onWheel={event => handleCanvasMouseWheel(event, mainCamera)}
        onTouchStart={event => handleCanvasTouchStart(event, mainCamera, touchRef.current)}
        onTouchMove={event => handleCanvasTouchMove(event, mainCamera, touchRef.current)}
        onTouchEnd={event => handleCanvasTouchEnd(event)}
        onClick={event => handleCanvasClick(
            event,
            renderer,
            store.getAnimals,
            store.setActiveEntity,
            store.removeActiveEntity)}/>;
})

export default Scene;