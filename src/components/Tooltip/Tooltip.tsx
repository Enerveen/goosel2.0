import React, {ReactNode, useCallback, useState} from "react";
import classes from './Tooltip.module.scss'
import {clsSum} from "../../utils/utils";

interface ITooltipProps {
    children: ReactNode | ReactNode[],
    position?: 'top' | 'bottom' | 'left' | 'right',
    tooltipContent: string | ReactNode | ReactNode[]
}

const Tooltip = ({children, tooltipContent, position = 'top'}: ITooltipProps) => {
    const [visible, setVisible] = useState(false)
    const show = useCallback(() => setVisible(true), [])
    const hide = useCallback(() => setVisible(false), [])
    const tooltipClassName = clsSum(
        classes.tooltip,
        position === 'top' ? classes.top : null,
        position === 'bottom' ? classes.bottom : null,
        position === 'left' ? classes.left : null,
        position === 'right' ? classes.right : null,
    )

    return <span className={classes.tooltipWrapper}>
        <span
            className={classes.targetElement}
            onMouseLeave={hide}
            onMouseEnter={show}
        >
            {children}
        </span>
        {visible ? <span className={tooltipClassName}>
            {tooltipContent}
        </span> : <></>}
    </span>
}

export default Tooltip