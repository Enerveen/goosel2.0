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
import {appPhase, BoundingBox} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {fieldSize} from "../../constants/simulation";
import {Camera} from "../../graphics/Camera";
import ImageContext from "../../stores/ImageContext";
import {BoidsSystem} from "../../entities/BoidEntity";
import Entity from "../../entities/Entity";

interface ISceneProps {
    store: SimulationStore,
    setAppPhase: (phase: appPhase) => void
}

const Scene = observer(({store, setAppPhase}: ISceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize(store)
    const images = useContext(ImageContext)
    const renderer = useMemo(() => new Renderer(context, images), [context])
    const mainCamera = useMemo(() => new Camera({x: fieldSize.x / 2, y: fieldSize.y / 2}, {
        x: fieldSize.x ,
        y: fieldSize.y
    }), [fieldSize, canvasWidth, canvasHeight]);
    const boidsSystem = useMemo(() => new BoidsSystem(120, fieldSize), [fieldSize]);

    const init = useCallback(() => {
        console.log('Simulation has started with the following constants:',
            JSON.stringify(store.getSimulationConstants, null, 4))
        store.addAnimal(generateAnimals(store.getSimulationConstants.initialAnimalCount,
            {width: fieldSize.x, height: fieldSize.y}, store.getSimulationConstants.animalMaxEnergy))
        store.addPlant(generateFood(store.getSimulationConstants.initialFoodCount,
            {width: fieldSize.x, height: fieldSize.y}))
    }, [canvasWidth, canvasHeight])


    const calculateStep = useCallback((timestamp: number) => {
        if (timestamp === 0) {
            init()
        }
        if (!store.getAnimals.length) {
            setAppPhase('FINISHED')
            return
        }

        boidsSystem.follow([new Entity({x: canvasWidth / 2, y: canvasHeight / 2})], 50000.0, true);
        boidsSystem.steerAwayFrom(store.getAnimals, 1.0, true);
        boidsSystem.update(0.1 * store.simulationSpeed);

        store.clearAnimalCorpses()
        store.gatherStatistics()
        if (!getRandomInRange(0, store.getSimulationConstants.foodSpawnChanceK / store.simulationSpeed)) {
            store.addPlant(new Plant({
                id: `P${store.getId()}`,
                nutritionValue: getRandomInRange(
                    store.getSimulationConstants.foodNutritionMin,
                    store.getSimulationConstants.foodNutritionMax
                ),
                position: getRandomPosition(fieldSize.x, fieldSize.y)
            }))
        }
        store.getAnimals.forEach(animal => animal.live(
            timestamp,
            store.getPlants,
            store.getAnimals,
            store.removePlant,
            store.addAnimal,
            {
                width: fieldSize.x,
                height: fieldSize.y
            },
            store.simulationSpeed,
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

        mainCamera.checkBounds(new BoundingBox(0, fieldSize.x, 0, fieldSize.y));
        {
            const scale = Math.min(canvasWidth / mainCamera.fov.x, canvasHeight / mainCamera.fov.y);
            context.translate(canvasWidth / 2 - mainCamera.position.x * scale, canvasHeight / 2 - mainCamera.position.y * scale);
            context.scale(scale, scale);
        }

        renderer.drawSeamlessBackground({width: fieldSize.x, height: fieldSize.y})
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

        renderer.drawButterflies(boidsSystem.boids, timestamp);
        renderer.drawClouds(timestamp);

        // Plants example
        // const searchObb = new BoundingBox(500, 1000, 500, 1000);
        //
        // context.strokeStyle = 'blue';
        // context.strokeRect(searchObb.left, searchObb.top, 500, 500);
        //
        // const quadtree = new Quadtree({x: 100, y: 100}, 2000);
        // store.getPlants.forEach(animal => {
        //     quadtree.push(animal);
        // })
        // const result = quadtree.get(searchObb);
        // result.forEach(entity => {
        //     context.fillRect(entity.position.x, entity.position.y, 10, 10);
        // })
        //
        // quadtree.dbgDraw(context);
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
                const timestamp = store.timestamp
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