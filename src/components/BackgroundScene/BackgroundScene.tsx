import {useContext, useEffect, useMemo, useRef, useState} from "react";
import useWindowSize from "../../hooks/useWindowSize";
import ImageContext from "../../stores/ImageContext";
import Renderer from "../../graphics/Renderer";
import classes from './BackgroundScene.module.scss'
import Animal from "../../entities/Animal";
import {generateAnimals} from "../../utils/helpers";


const BackgroundScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animalsRef = useRef<Animal[]>([])
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const {width: canvasWidth, height: canvasHeight} = useWindowSize()
    const images = useContext(ImageContext)
    const renderer = useMemo(() => new Renderer(context, images), [context])

    const step = () => {
        if (context) {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            renderer.drawBackground({width: canvasWidth, height: canvasHeight})
            animalsRef.current.forEach(entity => {
                entity.live(true)
                renderer.drawAnimal(entity.position,
                    {
                        gender: entity.gender,
                        age: entity.age.current,
                        isAlive: entity.isAlive,
                        name: entity.name,
                        currentActivity: entity.currentActivity.activity,
                        birthTimestamp: entity.age.birthTimestamp
                    }
                )
            })
        }
    }


    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            setContext(ctx);
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        animalsRef.current = generateAnimals(Math.floor(Math.max(canvasWidth, canvasHeight) / 100), true)
        if (context) {
            const render = () => {
                step()
                animationFrameId = window.requestAnimationFrame(render);
            };
            render();
        }
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [context, step]);

    return <canvas
        className={classes.canvas}
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
    />
}

export default BackgroundScene