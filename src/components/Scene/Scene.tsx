import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import classes from './Scene.module.scss'
import {observer} from "mobx-react-lite";
import {SimulationStore} from "../../stores/simulationStore";
import {getRandomInRange, rollNPercentChance} from "../../utils/utils";
import Plant from "../../entities/Plant";
import {
    generateAnimals,
    generateFood
} from "../../utils/helpers";
import Renderer from "../../graphics/Renderer";
import {appPhase, BoundingBox, plantKind} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {Camera} from "../../graphics/Camera";
import ImageContext from "../../stores/ImageContext";
import {
    handleCanvasClick, handleCanvasMouseMove,
    handleCanvasMousePress, handleCanvasMouseRelease, handleCanvasMouseWheel, handleCanvasTouchEnd,
    handleCanvasTouchMove,
    handleCanvasTouchStart
} from "../../utils/eventHandlers";
import Vector2 from "../../dataStructures/Vector2";
import {plantsKinds} from "../../constants/simulation";


import {Shader} from "../../graphics/Shader";
import {defaultShader} from "../../graphics/shaders";
import {glScene} from "../../graphics/GLScene";



interface ISceneProps {
    store: SimulationStore,
    setAppPhase: (phase: appPhase) => void
}

const Scene = observer(({store, setAppPhase}: ISceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const secretCanvasRef = useRef<HTMLCanvasElement>(null);

    const touchRef = useRef({start: 0, end: 0})
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [glContext, setGlContext] = useState<WebGL2RenderingContext | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize()
    const images = useContext(ImageContext)
    const renderer = useMemo(() => new Renderer(context, images), [context])
    const mainCamera = useMemo(() => new Camera(
        {
            x: store.getSimulationConstants.fieldSize.width / 2,
            y: store.getSimulationConstants.fieldSize.height / 2
        },
        new Vector2(
            store.getSimulationConstants.fieldSize.width,
            store.getSimulationConstants.fieldSize.height
        )), [
        store.getSimulationConstants.fieldSize.width,
        store.getSimulationConstants.fieldSize.height,
        canvasWidth,
        canvasHeight
    ]);

    useMemo(() => {
        glScene.nativeCanvasContext = context;
        glScene.resetTexture();
    }, [context])


    const init = useCallback(() => {
        console.log('Simulation has started with the following constants:',
            JSON.stringify(store.getSimulationConstants, null, 4))
        store.addAnimal(generateAnimals(store.getSimulationConstants.initialAnimalCount))
        store.addPlant(generateFood(store.getSimulationConstants.initialFoodCount))
    }, [canvasWidth, canvasHeight])


    const calculateStep = useCallback(() => {
        if (!store.getAnimals.length) {
            setAppPhase('FINISHED')
            return
        }
        store.clearAnimalCorpses()
        store.gatherStatistics()
        if (rollNPercentChance(store.getSimulationConstants.foodSpawnChance * store.getSimulationSpeed)) {
            const isSpecial = rollNPercentChance(0.2)
            store.addPlant(new Plant({kind: isSpecial ?
                    plantsKinds[getRandomInRange(0, 5)] as plantKind : 'common'}
            ))
        }
        store.getAnimals.forEach(animal => animal.live())
    }, [context, canvasWidth, canvasHeight])


    const drawStep = useCallback(() => {
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
            height: store.getSimulationConstants.fieldSize.height
        })
        store.getPlants.forEach(entity => {
            renderer.drawPlant(entity.position, entity.kind)
        })
        store.getAnimals.forEach(entity => {
            renderer.drawAnimal(
                entity.position,
                {
                    gender: entity.gender,
                    age: entity.age.current,
                    isAlive: entity.isAlive,
                    name: entity.name,
                    currentActivity: entity.currentActivity.activity,
                    birthTimestamp: entity.age.birthTimestamp
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

        renderer.drawClouds();
        if (!store.getLogHidden) {
            renderer.drawLogs()
        }
        renderer.drawClouds();

        glScene.update();

    }, [context, glContext, canvasWidth, canvasHeight]);

    useEffect(() => {
        if (canvasRef.current && secretCanvasRef.current) {
            const canvas = canvasRef.current;

            const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
            setContext(ctx);
            const gl = secretCanvasRef.current.getContext('webgl2') as WebGL2RenderingContext;
            setGlContext(gl);
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        if (context) {
            const render = () => {
                const timestamp = store.getTimestamp
                if (timestamp === 0) {
                    init()
                }
                calculateStep();
                drawStep();
                store.updateTimestamp()
                animationFrameId = window.requestAnimationFrame(render);
            };

            Shader.initContext(glContext as WebGL2RenderingContext);
            glScene.init(glContext as WebGL2RenderingContext);

            render();
        }
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [context, glContext, drawStep, store]);

    return <>
            <canvas
            className={classes.canvas}
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={event => handleCanvasMousePress(event, mainCamera)}
            onMouseUp={handleCanvasMouseRelease}
            onMouseMove={event => handleCanvasMouseMove(event, mainCamera)}
            onWheel={event => handleCanvasMouseWheel(event, canvasWidth, canvasHeight, mainCamera)}
            onTouchStart={event => handleCanvasTouchStart(event, mainCamera, touchRef.current)}
            onTouchMove={event => handleCanvasTouchMove(event, mainCamera, touchRef.current)}
            onTouchEnd={event => handleCanvasTouchEnd(event)}
            onClick={event => handleCanvasClick(
                event,
                renderer
            )}/>
            <canvas
                width={canvasWidth}
                height={canvasHeight}
                className={classes.secretCanvas}
                ref={secretCanvasRef}
            />
        </>
})

export default Scene;