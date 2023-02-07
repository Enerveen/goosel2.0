import React from "react";
import classes from './Checkbox.module.scss'
import {clsSum} from "../../utils/utils";

interface ICheckboxProps {
    label: string
    onChange: () => void,
    checked: boolean,
    className?: string
}

const Checkbox = ({label, onChange, checked, className}: ICheckboxProps) =>
    <div className={clsSum(classes.checkboxContainer, className)}>
        {label ? <span>{label}</span> : <></>}
        <input type={'checkbox'} {...{onChange, checked}}/>
    </div>

export default Checkbox