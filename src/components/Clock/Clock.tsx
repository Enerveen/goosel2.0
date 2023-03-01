import React, {useEffect, useRef, useState} from "react";
import drawClock from "../../graphics/drawClock";
import simulationStore from "../../stores/simulationStore";
import {observer} from "mobx-react-lite";

const Clock = observer(() => {
    const timestamp = simulationStore.getTimestamp
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
            drawClock(timestamp, context, 220, 220);
        }

    }, [context, timestamp]);

    return <canvas width={220} height={220} ref={canvasRef}/>
})

export default Clock