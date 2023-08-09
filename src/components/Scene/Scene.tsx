import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import classes from './Scene.module.scss'
import {observer} from "mobx-react-lite";
import simulationStore, {SimulationStore} from "../../stores/simulationStore";
import {getRandomInRange, rollNPercentChance} from "../../utils/utils";
import Plant from "../../entities/Plant";
import {generateAnimals, generateFood} from "../../utils/helpers";
import Renderer from "../../graphics/Renderer";
import {appPhase, plantKind} from "../../types";
import useWindowSize from "../../hooks/useWindowSize";
import {Camera} from "../../graphics/Camera";
import ImageContext from "../../stores/ImageContext";
import {
    handleCanvasClick,
    handleCanvasMouseMove,
    handleCanvasMousePress,
    handleCanvasMouseRelease,
    handleCanvasMouseWheel,
    handleCanvasTouchEnd,
    handleCanvasTouchMove,
    handleCanvasTouchStart
} from "../../utils/eventHandlers";
import Vector2 from "../../dataStructures/Vector2";
import {plantsKinds} from "../../constants/simulation";
import {BoidsSystem} from "../../entities/BoidEntity";
import Entity from "../../entities/Entity";
import {BoundingBox} from "../../dataStructures/Quadtree";


import {Shader} from "../../graphics/Shader";
import {RENDER_PASS} from "../../constants/render";
import {glDriver} from "../../graphics/GLDriver";
import {GrassSystem} from "../../simulationSystems/GrassSystem";


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

    const boidsSystem = useMemo(() => new BoidsSystem(120, { x: store.getSimulationConstants.fieldSize.width, y: store.getSimulationConstants.fieldSize.height }), [store.getSimulationConstants.fieldSize]);
    const grassSystem = useMemo(() => new GrassSystem(25000), [])


    const init = () => {
        console.log('Simulation has started with the following constants:',
            JSON.stringify(store.getSimulationConstants, null, 4))
        store.addAnimal(generateAnimals(store.getSimulationConstants.initialAnimalCount))
        store.addPlant(generateFood(store.getSimulationConstants.initialFoodCount))

        glDriver.init(glContext as WebGL2RenderingContext);
    }


    const calculateStep = useCallback(() => {
        const timestamp = store.getTimestamp
        if (!store.getAnimals.length) {
            setAppPhase('FINISHED')
            return
        }
        //store.clearAnimalCorpses()

        boidsSystem.follow([new Entity({x: store.getSimulationConstants.fieldSize.width / 2, y: store.getSimulationConstants.fieldSize.height / 2}, 'ZHOPA')], 500000.0, true);
        boidsSystem.steerAwayFrom(store.getAnimals, 10.0, true);
        boidsSystem.update(0.1 * store.simulationSpeed);

        store.clearAnimalCorpses()
        store.gatherStatistics()
        if (rollNPercentChance(store.getSimulationConstants.foodSpawnChance * store.getSimulationSpeed)) {
            const isSpecial = rollNPercentChance(0.2)
            store.addPlant(new Plant({
                    kind: isSpecial ?
                        plantsKinds[getRandomInRange(0, 6)] as plantKind : 'common'
                }
            ))
        }
        store.getAnimals.forEach(animal => animal.live())
        store.getEggs.forEach(egg => {
            if(timestamp > egg.hatchTimestamp) {
                egg.hatch()
            }
        })

        grassSystem.update(store.getAnimals);
    }, [context, canvasWidth, canvasHeight])


    const drawStep = useCallback((pass: RENDER_PASS) => {
        if (!context) {
            return;
        }

        context.resetTransform();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //mainCamera.checkBounds(new BoundingBox(0, store.getSimulationConstants.fieldSize.width,
        //   0, store.getSimulationConstants.fieldSize.height));
        {
            const scale = Math.min(canvasWidth / mainCamera.fov.x, canvasHeight / mainCamera.fov.y);
            context.translate(canvasWidth / 2 - mainCamera.position.x * scale, canvasHeight / 2 - mainCamera.position.y * scale);
            context.scale(scale, scale);

            glDriver.setGlobalTransform(context.getTransform().toFloat32Array());

            if (pass === RENDER_PASS.COLOR) {
                glDriver.createShadowMap(mainCamera.position, scale);
            }
        }

        glDriver.renderPrepare(pass);

        if (glDriver.gl && glDriver.defaultShader) {
            glDriver.defaultShader.bind()

            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_time'), simulationStore.getTimestamp);
            glDriver.gl.uniformMatrix4fv(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_transform'), false, glDriver.transform);
            glDriver.gl.uniform2f(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_resolution'), glDriver.gl.canvas.width, glDriver.gl.canvas.height);
            glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'intensityMultiplier'), 0.0);

            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'tex'), 0);

            if (pass === RENDER_PASS.COLOR) {
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'shadowMap'), 1);
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'gBuffer'), 2);

                glDriver.shadowMapRT?.getTexture().bind(1);
                glDriver.depthRT?.getTexture().bind(2);
            }
            //GLTexture.fromImage(renderer.eggsAtlas.image).bind(1);
        }

        if (pass === RENDER_PASS.COLOR && glDriver.gl && glDriver.defaultShader) {
            glDriver.gl!.uniform1i(glDriver.gl!.getUniformLocation(glDriver.defaultShader!.glShaderProgram, 'isTerrain'), 1);
            renderer.drawSeamlessBackground({
                width: store.getSimulationConstants.fieldSize.width,
                height: store.getSimulationConstants.fieldSize.height
            })
            glDriver.gl!.uniform1i(glDriver.gl!.getUniformLocation(glDriver.defaultShader!.glShaderProgram, 'isTerrain'), 0);
        }

        if (glDriver.gl && glDriver.defaultShader) {
            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_isSkew'), 1);
            renderer.drawPlants(store.getPlants);
            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'isGrass'), 1);
            renderer.drawGrass(grassSystem);

            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_isSkew'), 0);
            glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'isGrass'), 0);

            glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'intensityMultiplier'), 30.0);
            renderer.drawButterflies(boidsSystem.boids, store.getTimestamp);
            glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'intensityMultiplier'), 0.0);
        }

        store.getPlants.forEach(entity => renderer.drawPlant(entity.position, entity.kind))
        store.getCorpses.forEach(entity => renderer.drawCorpse(entity.position, entity.age))
        store.getEggs.forEach(entity => renderer.drawEgg(entity.position))
        store.getAnimals.forEach(entity => {
            renderer.drawAnimal(
                entity.position,
                {
                    gender: entity.gender,
                    age: entity.age.current,
                    name: entity.name,
                    currentActivity: entity.currentActivity.activity,
                    birthTimestamp: entity.age.birthTimestamp,
                    direction: entity.speed
                }
            )
            renderer.drawLabels(entity.position,
                {
                    gender: entity.gender,
                    age: entity.age.current,
                    name: entity.name,
                    currentActivity: entity.currentActivity.activity,
                    isGay: entity.genes.gay
                }
            )
            if (entity.id === store.getActiveEntity?.id) {
                store.setActiveEntity(entity)
            }
        })

        if (pass === RENDER_PASS.COLOR) {
            if (glDriver.gl && glDriver.waterShader) {
                glDriver.sceneCopyTexture!.bind(1);
                glDriver.gl.copyTexImage2D(glDriver.gl.TEXTURE_2D, 0, glDriver.gl.RGBA32F, 0, 0, glDriver.mainRT!.width, glDriver.mainRT!.height, 0);
                glDriver.sceneCopyTexture!.unbind(1);
                // glDriver.sceneCopyTexture!.bind(0);
                // glDriver.gl.copyTexImage2D(glDriver.gl.TEXTURE_2D, 0, glDriver.gl.RGBA32F, 0, 0, glDriver.mainRT!.width, glDriver.mainRT!.height, 0);
                // glDriver.sceneCopyTexture!.unbind(0);

                glDriver.waterShader.bind();

                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.waterShader.glShaderProgram, 'backgroundTex'), 0);
                glDriver.gl.uniformMatrix4fv(glDriver.gl.getUniformLocation(glDriver.waterShader.glShaderProgram, 'u_transform'), false, glDriver.transform);
                glDriver.gl.uniform2f(glDriver.gl.getUniformLocation(glDriver.waterShader.glShaderProgram, 'pos'), 800.0, 400.0);
                glDriver.gl.uniform2f(glDriver.gl.getUniformLocation(glDriver.waterShader.glShaderProgram, 'scale'), 310.0, 310.0);
                glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.waterShader.glShaderProgram, 'camScale'), mainCamera.getFovScale());

                glDriver.sceneCopyTexture!.bind(0);
                glDriver.drawQuad(glDriver.waterShader);
                glDriver.sceneCopyTexture!.unbind(0);
            }


            glDriver.depthRT?.getTexture().unbind(2);

            if (glDriver.gl && glDriver.lightningShader) {
                glDriver.lightningShader.bind();
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.lightningShader.glShaderProgram, 'emissionTex'), 1);
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.lightningShader.glShaderProgram, 'cloudsTex'), 2);
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.lightningShader.glShaderProgram, 'gBuffer'), 3);
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.lightningShader.glShaderProgram, 'depthOffsetTex'), 4);
                glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.lightningShader.glShaderProgram, 'camScale'), mainCamera.getFovScale());

                glDriver.mainRT!.getTexture(1).bind(1);
                glDriver.shadowMapRT!.getTexture(0).bind(2);
                glDriver.depthRT!.getTexture(0).bind(3);
                glDriver.mainRT!.getTexture(2).bind(4);

                glDriver.copyImage(glDriver.mainRT!.getTexture(0), glDriver.lightningShader, glDriver.lightningRT);

                glDriver.mainRT!.getTexture(1).unbind(1);
                glDriver.shadowMapRT!.getTexture(0).unbind(2);
                glDriver.depthRT!.getTexture(0).unbind(3);
                glDriver.mainRT!.getTexture(2).bind(4);
            }

            if (glDriver.gl && glDriver.copyShader) {
                glDriver.copyShader.bind();
                glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.copyShader.glShaderProgram, 'camScale'), mainCamera.getFovScale());
                glDriver.gl.uniform1i(glDriver.gl.getUniformLocation(glDriver.copyShader.glShaderProgram, 'bloomMask'), 1);
                glDriver.lightningRT!.getTexture(1).bind(1);
                glDriver.copyImage(glDriver.lightningRT!.getTexture(0));
                glDriver.lightningRT!.getTexture(1).unbind(1);
            }
        } else if (pass === RENDER_PASS.DEPTH) {
            glDriver.depthRT?.unbind();
        }
        //glDriver.copyImage(glDriver.depthRT!.getTexture(0), null, 1);

        //renderer.drawClouds();
        if (!store.getLogHidden) {
            renderer.drawLogs()
        }
    }, [context, glContext, canvasWidth, canvasHeight]);

    useEffect(() => {
        if (canvasRef.current && secretCanvasRef.current) {
            const canvas = canvasRef.current;

            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            setContext(ctx);
            const gl = secretCanvasRef.current.getContext('webgl2') as WebGL2RenderingContext;
            setGlContext(gl);
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        if (context && glContext) {
            const render = () => {
                const timestamp = store.getTimestamp
                if (timestamp === 0) {
                    init()
                }
                calculateStep();
                drawStep(RENDER_PASS.DEPTH);
                drawStep(RENDER_PASS.COLOR);
                store.updateTimestamp()
                animationFrameId = window.requestAnimationFrame(render);
            };

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