import React, {ReactNode} from "react";
import classes from './Button.module.scss'
import {clsSum} from "../../utils/utils";

interface IButtonProps {
    children: string | ReactNode | ReactNode[],
    onClick: () => void,
    className?: string
}

const Button = ({children, onClick, className}: IButtonProps) =>
    <button className={clsSum(classes.button, className)} onClick={onClick}>
        {children}
    </button>

export default Button