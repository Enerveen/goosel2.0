import React, {ChangeEvent} from "react";
import classes from './Checkbox.module.scss'
import {clsSum} from "../../utils/utils";
import Tooltip from "../Tooltip/Tooltip";

interface ICheckboxProps {
    label: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    checked: boolean,
    className?: string,
    tooltipContent?: string
}

const Checkbox = ({label, onChange, checked, className, tooltipContent}: ICheckboxProps) =>
    <div className={clsSum(classes.checkboxContainer, className)}>
        {label ? <span>{label}</span> : <></>}
        <input type={'checkbox'} {...{onChange, checked}}/>
        {tooltipContent ? <Tooltip tooltipContent={tooltipContent}>
            <span className={classes.tooltipIcon}>?</span>
        </Tooltip> : <></>}
    </div>

export default Checkbox