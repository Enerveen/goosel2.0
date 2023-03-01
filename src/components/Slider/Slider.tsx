import React, {ChangeEvent} from "react";
import classes from './Slider.module.scss'
import {clsSum} from "../../utils/utils";
import Tooltip from "../Tooltip/Tooltip";

interface ISliderProps {
    id: string,
    min: number,
    max: number,
    step?: number,
    value: number,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    label?: string,
    className?: string,
    tooltipContent?: string
}

const Slider = ({label, id, min, max, className, value, tooltipContent, ...props}: ISliderProps) =>
    <div className={clsSum(className, classes.sliderContainer)}>
        <div className={classes.labelContainer}>
            {label || tooltipContent ? <label htmlFor={id} className={classes.label}>
                {label}
                {tooltipContent ? <Tooltip tooltipContent={tooltipContent}>
                    <span className={classes.tooltipIcon}>?</span>
                </Tooltip> : <></>}
            </label> : <div/>}
            {value}
        </div>
        <input type={'range'} min={min} max={max} {...props} id={id} value={value} className={classes.slider}/>
        <div className={classes.minMaxLabels}>
            <span>{min}</span>
            <span>{max}</span>
        </div>
    </div>

export default Slider