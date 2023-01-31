import React, {useEffect, useRef, useState} from "react";
import drawClock from "../../graphics/drawClock";
import {observer} from "mobx-react-lite";

interface IClockProps {
    timestamp: number
}

const Clock = observer(({timestamp}:IClockProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            setContext(ctx);
        }
    }, []);

    useEffect(() => {

        if (context) {
            drawClock(timestamp, context, 300, 300);
        }

    }, [context, timestamp]);

    return <canvas width={300} height={300} ref={canvasRef}/>
})

export default Clock