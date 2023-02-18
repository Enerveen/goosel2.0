import React, {useCallback, useEffect, useRef, useState} from "react";
import classes from './RangeSlider.module.scss'
import Tooltip from "../Tooltip/Tooltip";

interface IRangeSliderProps {
    initialValues: number[]
    minGap: number,
    max: number,
    min: number,
    label?: string,
    className?: string,
    onValuesChange: (values: number[], event?: HTMLInputElement) => void,
    step?: number
    tooltipContent?: string
}

const RangeSlider = ({initialValues, minGap = 0, max, min, label, className, onValuesChange, step = 1, tooltipContent}: IRangeSliderProps) => {
    const [values, setValues] = useState(initialValues)
    const trackRef = useRef<HTMLDivElement | null>(null)

    const slideOne = useCallback((value:number) => {
        if (values[1] - value < minGap) {
            setValues(prevValue => [prevValue[1] - minGap, prevValue[1]])
        } else {
            setValues(prevValue => [value, prevValue[1]])
        }
    }, [minGap, values])
    const slideTwo = useCallback((value: number) => {
        if (value - values[0] < minGap) {
            setValues(prevValue => [prevValue[0], prevValue[0] + minGap])
        } else {
            setValues(prevValue => [prevValue[0], value])
        }
    }, [minGap, values])

    const fillColor = useCallback(() => {
        const percent1 = (values[0] / max) * 100;
        const percent2 = (values[1] / max) * 100;
        if (trackRef.current) {
            trackRef.current.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #5fa35c ${percent1}% , #5fa35c ${percent2}%, #dadae5 ${percent2}%)`;
        }
    }, [max, values])

    useEffect(() => {
        slideOne(values[0])
        slideTwo(values[1])
        fillColor()
    }, [])

    useEffect(() => {
        onValuesChange(values)
        fillColor()
    }, [fillColor, values, onValuesChange])

    return <div className={className}>
        <div className={classes.labelContainer}>
            {label || tooltipContent ? <label className={classes.label}>
                {label}
                {tooltipContent ? <Tooltip tooltipContent={tooltipContent}>
                    <span className={classes.tooltipIcon}>?</span>
                </Tooltip> : <></>}
            </label> : <div/>}
            <span>{values[0]} - {values[1]}</span>
        </div>
        <div className={classes.sliderContainer}>
            <div className={classes.sliderTrack} ref={trackRef}/>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={values[0]}
                onChange={(e) => slideOne(+e.target.value)}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={values[1]}
                step={step}
                onChange={(e) => slideTwo(+e.target.value)}
            />
        </div>
        <div className={classes.minMaxLabels}>
            <span>{min}</span>
            <span>{max}</span>
        </div>
    </div>
}

export default RangeSlider